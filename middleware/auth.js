// This file contains the middleware class for authentication.

// Get the required modules, JWT decoding
import { authRoutes } from "../routes/auth.js";

/**
 * Middleware class for authentication
 * This class is used to validate the user.
 * If the user is authenticated, it calls the next function.
 * This also navigates to the home page if the user is authenticated.
 * 
 */
export class AuthMiddleware {
  
  /**
   * This function is used to validate the user, gets the access token from cookie.
   * If the token is valid, it calls the next function.
   * Otherwise, it redirects to the login page.
   * @param {*} req - request
   * @param {*} res - response
   * @param {*} next - callback function
   */
  static async ValidateUser(req, res, next) {
    // Get the access token from the cookie
    const cookie = req.headers.cookie;
    const token = cookie.includes("access_token") ? cookie.split('=')[1] : null;

    // Check if the token is valid
    const result = await authRoutes.decodeToken(token);

    // If the token is valid, call the next function
    if (result.success)
      next(req, res);
    // If the token is invalid, redirect to the login page
    else      
      res.writeHead(302, { Location: '/login' });
      // window.location.href = '/login';
  }

  /**
   * Navigates to the home page if the user is authenticated.
   * Otherwise, it calls the next function.
   * Meant for Login and Register pages
   * @param {*} req - request
   * @param {*} res - response
   * @param {*} next - call back function
   */
  static async NavigateProperly(req, res, next)
  {
    // If the cookie is not present, call the next function
    if (req.headers.cookie === null || req.headers.cookie === undefined)
      next(req, res);
    else
    {
      // Check if the user is authenticated by cookie token
      const cookie = req.headers.cookie;
      const token = cookie.includes("access_token") ? cookie.split('=')[1] : null;
      // If the token is valid, navigate to the home page
      const result = await authRoutes.decodeToken(token);
      if (result.success)
        res.writeHead(302, { Location: '/home' });
        // window.location.href = '/home';
      // Otherwise, call the next function
      else
        next(req, res);
    }
  }

  /**
   * Validates the role of the user.
   * If the user is an admin, it calls the next function. (Admin Dashboard)
   * Otherwise, it redirects to the home page.
   * If the token is invalid, it redirects to the login page.
   * @param {*} req - request
   * @param {*} res - response
   * @param {*} next - callback function
   */
  static async ValidateRole(req, res, next)
  {
    // Get the access token from the cookie
    const cookie = req.headers.cookie;
    const token = cookie.includes("access_token") ? cookie.split('=')[1] : null;

    // Check if the token is valid
    const result = await authRoutes.decodeToken(token);

    // If the token is valid, call the next function
    if (result.success)
    {
      const decoded = result.decoded;
      if (decoded.role === 'admin')
        next(req, res);
      else
      {
        // If the user is not an admin, redirect to the home page
        res.writeHead(302, { Location: '/home' });
      }
    }
    // If the token is invalid, redirect to the login page
    else      
      res.writeHead(302, { Location: '/login' });

      // window.location.href = "/login";
  }
}
