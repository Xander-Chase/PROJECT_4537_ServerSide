import http from 'http';
import url from 'url';
import connectDB from './db.js'; // MongoDB connection
import dotenv from 'dotenv'; // Environment variables

// For Swagger
import fs from 'fs';
import path from 'path';
import swaggerUiDist from 'swagger-ui-dist';
import { fileURLToPath } from 'url';

// Define __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define swaggerUiPath
const swaggerUiPath = swaggerUiDist.getAbsoluteFSPath();

import { AutoTokenizer, pipeline } from '@xenova/transformers';

// Constants
import { CORS_YOUR_ORIGIN, MappedEndpoints } from './constants/development.js';
// Route Imports
import { login, register, decodeToken } from './routes/auth.js'; // Ensure correct import
import { deleteUserById, getAll } from './routes/admin.js'; // Ensure correct import
import { getEntireUserbyId, createStory, getUserApiUsageById } from "./routes/user.js"; // Ensure correct import
import incrementEndpointCount from './routes/endpoints.js'; // Ensure correct import

// Middleware Imports
import {AuthMiddleware} from "./middleware/auth.js";
import { StoryContentObject } from './models/Story.js';
import { decreaseApiUsageByUserId, deleteStoryByStoryId, updateStoryById, updateStoryByUserId } from './routes/misc.js';
import { Messages } from './constants/en.js';

// Constants and Variables
// Messages
// Move to lang/en.js
const MESSAGES = {
  logger: {
    info: "INFO:",
    warn: "WARN:",
    error: "ERROR:"
  },
  receivedPrompt: "Received Prompt:",
  loadingModel: "Loading model...",
  modelLoaded: "Model loaded successfully",
  routeNotFound: "Route not found"
}
dotenv.config(); // Load environment variables

/**
 * Server class
 * Runs the program
 */
class Server {
  constructor(port) {
    this.port = port;
    this.server = http.createServer(this.handleRequest.bind(this));
    this.generator = null; // For the text-generation pipeline
    connectDB(); // Connect to MongoDB at server startup
    this.loadModel(); // Load the text generation model
  }

  /**
   * Load the text generation model
   */
  async loadModel() {
    try {
      
      console.log(`${MESSAGES.logger.info} ${MESSAGES.loadingModel}`);
      this.generator = await pipeline('text-generation', 'Xenova/distilgpt2');
      console.log(`${MESSAGES.logger.info} ${MESSAGES.modelLoaded}`);

    } catch (error) {
      process.exit(1);
    }
  }
  

  /**
   * Handles incoming requests
   * @param {*} req - request
   * @param {*} res - response
   * @returns response
   */
  async handleRequest(req, res) {
    res.setHeader('Access-Control-Allow-Origin', CORS_YOUR_ORIGIN); // Allow CORs on specific origin

    res.setHeader('Access-Control-Allow-Credentials', "true"); // Allow cookies
    res.setHeader('Access-Control-Allow-Headers', "Content-Type");
    res.setHeader('Access-Control-Allow-Methods', "GET, POST, DELETE, PUT, OPTIONS");
    
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;

    if (method === 'OPTIONS') {
      // For preflight requests, respond with 204 No Content and include CORS headers
      res.writeHead(204);
      res.end();
      return;
    }

    if (parsedUrl.pathname === '/swagger.json') {
      // Serve the swagger.json file
      const filePath = path.join(__dirname, 'swagger.json');

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Swagger file not found' }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
      });
      return;
    }

    if (parsedUrl.pathname.startsWith('/docs')) {
      let filePath = path.join(
        swaggerUiPath,
        parsedUrl.pathname.replace('/docs', '') || 'index.html'
      );
    
      // Check if the requested file exists
      if (!fs.existsSync(filePath)) {
        filePath = path.join(swaggerUiPath, 'index.html');
      }
    
      // Read and serve the file
      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'File not found' }));
          return;
        }  

        // Add this block to handleRequest
        if (filePath.endsWith('swagger-initializer.js')) {
          data = data
            .toString()
            .replace(
              'url: "https://petstore.swagger.io/v2/swagger.json",',
              'url: "/swagger.json",'
            );
        }

    
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.png': 'image/png',
        }[ext] || 'text/plain';
    
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      });
      return;
    }

    const isGetMethod = method === "GET";
    const isPostMethod = method === "POST";
    const isPutMethod = method === "PUT";
    const isDeleteMethod = method === "DELETE";

    switch (parsedUrl.pathname) {
      // Auth
      case `${MappedEndpoints.Auth}/login`:
        if (isPostMethod) await AuthMiddleware.NavigateProperly(req, res, this.handleLogin.bind(this));
        break;

      case `${MappedEndpoints.Auth}/register`:
        if (isPostMethod) await AuthMiddleware.NavigateProperly(req, res, this.handleRegister.bind(this));
        break;

      case`${MappedEndpoints.Auth}/logout`:
        if (isPostMethod) await AuthMiddleware.ValidateUser(req, res, this.handleLogOut.bind(this));
        break;
                
      case `${MappedEndpoints.User}/info`:
        if (isGetMethod) await AuthMiddleware.ValidateUser(req, res, this.handleGetUser.bind(this));
        break;

      case `${MappedEndpoints.User}/getApiUsage`:
        if (isGetMethod) await AuthMiddleware.ValidateUser(req, res, this.handleGetUserApiUsage.bind(this));
        break;
        
      case `${MappedEndpoints.User}/generate`:
        if (isPostMethod) await AuthMiddleware.ValidateUser(req, res, this.handleGenerateStory.bind(this));
        break;

      case `${MappedEndpoints.User}/generateNext`:
        if (isPutMethod) await AuthMiddleware.ValidateUser(req, res, this.handleGenerateNextStory.bind(this));
        break;

      case `${MappedEndpoints.Admin}/dashboard`:
        if (isGetMethod) await AuthMiddleware.ValidateRole(req, res, this.handleAdminDashboard.bind(this));
        break;

      case `${MappedEndpoints.Admin}/deleteUser`:
        if (isDeleteMethod) await AuthMiddleware.ValidateRole(req, res, this.handleDeleteUser.bind(this));
        break;

      case `${MappedEndpoints.User}/updateStory`:
        if (isPutMethod) await AuthMiddleware.ValidateUser(req, res, this.handleUpdateStoryOverall.bind(this));
        break;

      case `${MappedEndpoints.User}/deleteStory`:
        if (isDeleteMethod) await AuthMiddleware.ValidateUser(req, res, this.handleDeleteStory.bind(this));
        break;
      default:
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: MESSAGES.routeNotFound }));
    }
  }

  handleGetUserApiUsage = async (req, res) => {
    // Increment endpoint count
    await incrementEndpointCount("GET", `${MappedEndpoints.User}/getApiUsage`);

    // Get Token from cookie
    const cookie = req.headers.cookie;
    const token = cookie.includes('access_token') ? cookie.split('=')[1] : null;
    const result = await decodeToken(token);

    if (result.success) {
      const { id } = result.decoded;
      const userResult = await getUserApiUsageById(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ apiUsage: userResult.apiUsage }));
    } else {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: Messages.TokenInvalid }));
    }
  }

  handleGetUser = async (req, res) => 
  {
    // Increment endpoint count
    await incrementEndpointCount("GET", `${MappedEndpoints.User}/info`);
    // Get Token from cookie
    const cookie = req.headers.cookie;
    const token = cookie.includes('access_token') ? cookie.split('=')[1] : null;
    const result = await decodeToken(token);

    if (result.success) {
      const { id } = result.decoded;
      const userResult = await getEntireUserbyId(id);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ user: userResult.user, role: userResult.role, apiUsage: userResult.apiUsage, stories: userResult.stories }));
    }
    else
    {      
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: Messages.TokenInvalid }));
    }
  }

  handleGenerateNextStory = async (req, res) => 
  {
    try
    {
      const body = await this.getRequestBody(req);
      const { prompt, storyId, paginationIndex, prevList, chosenIndex} = JSON.parse(body);

      await incrementEndpointCount("PUT", `${MappedEndpoints.User}/generateNext`);
      console.log(`${MESSAGES.logger.info} ${MESSAGES.receivedPrompt} `, prompt);

      const generatedStoryPart = await this.generateStory(prompt);
      const promptOptions = [];

      for (let i = 0; i < 4; i++) {
        const generatedPrompt = await this.generatePrompt(generatedStoryPart);
        promptOptions.push(generatedPrompt);
      }

      const storyContent = new StoryContentObject(
        generatedStoryPart,
        promptOptions,
      )
      
      // First, set the chosen prompt
      prevList[paginationIndex].chosenPrompt = prevList[paginationIndex].prompts[chosenIndex];
      // Then, push the generated story part
      prevList.push(storyContent);
      // Finally, update the story
      const storyPayload = await updateStoryById(storyId, { content: prevList });

      if (!storyPayload.success)
        throw new Error(Messages.ErrorCreatingStory, storyPayload.error);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ storyObj: storyPayload }));
    }
    catch (error)
    {
      res.writeHead(500);
      res.end(JSON.stringify({ error: Messages.ErrorCreatingStory }));
    }
  }

  handleGenerateStory = async (req, res) =>
  {
    try {
      const body = await this.getRequestBody(req);
      const { prompt, userId} = JSON.parse(body);

      await incrementEndpointCount("POST", `${MappedEndpoints.User}/generate`);

      console.log(`${MESSAGES.logger.info} ${MESSAGES.receivedPrompt} `, prompt);

      const generatedStoryPart = await this.generateStory(prompt);
      const promptOptions = [];

      for (let i = 0; i < 4; i++) {
        const generatedPrompt = await this.generatePrompt(generatedStoryPart);
        promptOptions.push(generatedPrompt);
      }

      const storyContent = new StoryContentObject(
        generatedStoryPart,
        promptOptions,
      )
      
      const storyPayload = await createStory(userId, storyContent);
      
      if (!storyPayload.success)
        throw new Error(Messages.ErrorCreatingStory, storyPayload.error);

      // down here, decrease api usage
      const result = await decreaseApiUsageByUserId(userId);
      if (!(result.success))
      {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: result.error  }));
      }


      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ storyObj: storyPayload }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: Messages.ErrorCreatingStory }));
    }
  }

  // Updates the title and summary
  handleUpdateStoryOverall = async (req, res) =>
  {
    const body = await this.getRequestBody(req);
    const { title, summary, storyId } = JSON.parse(body);

    await incrementEndpointCount("PUT", `${MappedEndpoints.User}/updateStory`);
    const result = await updateStoryById(storyId, { title: title, summary: summary });

    if (result.success) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: Messages.StoryUpdated }));
    } 
    else
    {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: Messages.ErrorUpdatingStory }));
    }
  }

  handleDeleteStory = async (req, res) =>
  {
    const body = await this.getRequestBody(req);
    const { storyId } = JSON.parse(body);

    await incrementEndpointCount("DELETE", `${MappedEndpoints.User}/deleteStory`);

    // Once finished, call the deleteStorybyStoryId function
    const result = await deleteStoryByStoryId(storyId);

    if (result.success) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: Messages.StoryDeleted }));
    } 
    else {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: Messages.ErrorDeletingStory }));
    }
  }

  handleAdminDashboard = async (req, res) =>
  {
    try {
      await incrementEndpointCount("GET", `${MappedEndpoints.Admin}/dashboard`);
      const result = await getAll();

      if (result.success) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          endpoints: result.endpoints,
          data: result.data,
         }));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.error }));
      }
    } catch (error) {
      console.error('Admin dashboard error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: Messages.ErrorFetchingUsers }));
    }
  }

  handleDeleteUser = async (req, res) => 
  {
      const body = await this.getRequestBody(req);
      const { id } = JSON.parse(body);

      const result = await deleteUserById(id);

      await incrementEndpointCount("DELETE", `${MappedEndpoints.Admin}/deleteUser`);
      if (result.success) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: Messages.UserDeleted}));
      } 
      else {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: Messages.ErrorDeletingUser }));
      }
  }

  handleLogOut = async (req, res) =>
  {
    await incrementEndpointCount("POST", `${MappedEndpoints.Auth}/logout`);
    res.setHeader('Set-Cookie', `access_token=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/;`);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: Messages.LogoutSuccess }));
  }
  handleLogin = async (req, res) =>
  {
    try {
      const body = await this.getRequestBody(req);
      const { email, password } = JSON.parse(body);
  
      await incrementEndpointCount("POST", `${MappedEndpoints.Auth}/login`);
      const result = await login(email, password);
  
      if (result.success) {
        res.setHeader('Set-Cookie', `access_token=${result.token}; HttpOnly; Secure; SameSite=None; Max-Age=3600; Path=/;`);
        res.writeHead(200, { 
          'Content-Type': 'application/json',
         });
        res.end(JSON.stringify({ message: Messages.LoginSuccess }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.error }));
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: Messages.LoginFailed }));
    }
  }
  

  handleRegister = async (req, res) => 
  {
    try {
      const body = await this.getRequestBody(req);
      const { username, email, password } = JSON.parse(body);

      await incrementEndpointCount("POST", `${MappedEndpoints.Auth}/register`);
      if (!username || !email || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: Messages.AllFieldsRequired }));
      }

      const result = await register(username, email, password);

      if (result.success) {
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: Messages.UserRegister }));
      } else {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: result.error }));
      }
    } catch (error) {
      console.error('Register error:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: Messages.RegisterationError }));
    }
  }

  generateStory = async (prompt) => {
    const storyOutput = await this.generator(prompt, {
      max_length: 100,
      num_return_sequences: 1,
      no_repeat_ngram_size: 2,
      do_sample: true,
      top_k: 50,
      top_p: 0.95,
      temperature: 1.0,
    });
    return storyOutput[0].generated_text.trim();
  }

  generatePrompt = async (storyContext) =>
  {
    const promptOutput = await this.generator(`${Messages.GeneratePrompt_Opening}\"${storyContext}\"${Messages.GeneratePrompt_Closing}`, {
      max_length: 200,
      num_return_sequences: 1,
      no_repeat_ngram_size: 2,
      do_sample: true,
      top_k: 50,
      top_p: 1.0,
      temperature: 1.0,
    });

    let response = promptOutput[0].generated_text;

    // Extract the generated prompt from the response
    // only get the new prompt
    let generatedPrompt = `${response.substring(response.indexOf('Next:'))}`;

    if (generatedPrompt.toLowerCase().startsWith('next:')) {
      generatedPrompt = generatedPrompt.substring(5).trim();
    }
    return generatedPrompt.substring(0, 30).replace(/\w+$/, '').trim();
  }

  getRequestBody = (req) =>
  {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => resolve(body));
      req.on('error', (err) => reject(err));
    });
  }

  start = () => 
  {
    this.server.listen(this.port, () => {
      console.log(`${Messages.Listening}${this.port}`);
    });
  }
}

const serverInstance = new Server(process.env.PORT || 8080);
serverInstance.start();
