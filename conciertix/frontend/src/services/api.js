import axios from 'axios';

/**
 * @constant api
 * @description Creates an Axios instance with a pre-configured baseURL.
 * The baseURL is constructed from an environment variable `VITE_API_BASE_URL`
 * and appends '/api' to it, common for API endpoints.
 */
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
});

/**
 * Axios request interceptor.
 * This function is called before each request is sent.
 * It retrieves the authentication token from localStorage and, if found,
 * adds it to the Authorization header of the request as a Bearer token.
 */
api.interceptors.request.use(
  (config) => {
    // Retrieve the token from localStorage.
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, add it to the Authorization header.
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config; // Return the modified config.
  },
  (error) => {
    // Handle request errors (e.g., network issues before request is sent).
    return Promise.reject(error);
  }
);

// --- Artist specific API calls ---

/**
 * Fetches a paginated and optionally searched list of artists.
 * @async
 * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=10] - The number of artists per page.
 * @param {string} [searchTerm=''] - An optional search term to filter artists.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const getArtists = async (page = 1, limit = 10, searchTerm = '') => {
  // Construct search parameter string safely.
  const searchParam = searchTerm ? `&searchTerm=${encodeURIComponent(searchTerm)}` : '';
  return api.get(`/artists?page=${page}&limit=${limit}${searchParam}`);
};

/**
 * Fetches a single artist by their ID.
 * @async
 * @param {string|number} id - The ID of the artist to retrieve.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const getArtistById = async (id) => {
  return api.get(`/artists/${id}`);
};

/**
 * Creates a new artist.
 * @async
 * @param {Object} artistData - The data for the new artist.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const createArtist = async (artistData) => {
  return api.post('/artists', artistData);
};

/**
 * Updates an existing artist by their ID.
 * @async
 * @param {string|number} id - The ID of the artist to update.
 * @param {Object} artistData - The updated data for the artist.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const updateArtist = async (id, artistData) => {
  return api.put(`/artists/${id}`, artistData);
};

/**
 * Deletes an artist by their ID.
 * @async
 * @param {string|number} id - The ID of the artist to delete.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const deleteArtist = async (id) => {
  return api.delete(`/artists/${id}`);
};


// --- Event specific API calls ---

/**
 * Fetches a paginated list of events.
 * @async
 * @param {number} [page=1] - The page number to retrieve.
 * @param {number} [limit=10] - The number of events per page.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 * @todo Consider adding more filter parameters (genre, date, city, artistName, searchTerm) similar to HomePage.
 */
export const getEvents = async (page = 1, limit = 10) => {
  // Currently, this function in api.js is simpler than what HomePage uses.
  // HomePage constructs more complex params. This could be standardized.
  return api.get(`/events?page=${page}&limit=${limit}`);
};

/**
 * Fetches a single event by its ID.
 * @async
 * @param {string|number} id - The ID of the event to retrieve.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const getEventById = async (id) => {
  return api.get(`/events/${id}`);
};

/**
 * Creates a new event.
 * @async
 * @param {Object} eventData - The data for the new event.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const createEvent = async (eventData) => {
  return api.post('/events', eventData);
};

/**
 * Updates an existing event by its ID.
 * @async
 * @param {string|number} id - The ID of the event to update.
 * @param {Object} eventData - The updated data for the event.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const updateEvent = async (id, eventData) => {
  return api.put(`/events/${id}`, eventData);
};

/**
 * Deletes an event by its ID.
 * @async
 * @param {string|number} id - The ID of the event to delete.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const deleteEvent = async (id) => {
  return api.delete(`/events/${id}`);
};

// --- Auth specific API calls --- (Used by AuthContext)

/**
 * Logs in a user with the provided credentials.
 * @async
 * @param {Object} credentials - User credentials (e.g., { username, password }).
 * @returns {Promise<AxiosResponse>} The Axios response object, typically containing a token and user info.
 */
export const loginUser = async (credentials) => {
  return api.post('/auth/login', credentials);
};

/**
 * Registers a new user with the provided data.
 * @async
 * @param {Object} userData - User registration data (e.g., { username, email, password }).
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const registerUser = async (userData) => {
  return api.post('/auth/register', userData);
};

/**
 * Fetches details for the currently authenticated user.
 * Assumes an endpoint like '/users/me' that uses the auth token.
 * @async
 * @returns {Promise<AxiosResponse>} The Axios response object containing user details.
 */
export const getCurrentUser = async () => {
  return api.get('/users/me');
}

// --- Reservation specific API calls ---

/**
 * Fetches all reservations, potentially filtered and paginated.
 * @async
 * @param {Object} params - Query parameters for filtering and pagination
 *                          (e.g., { page, limit, userId, eventId, status }).
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const getAllReservations = async (params) => {
  return api.get('/reservations', { params });
};

/**
 * Cancels a specific reservation by its ID.
 * @async
 * @param {string|number} reservationId - The ID of the reservation to cancel.
 * @returns {Promise<AxiosResponse>} The Axios response object.
 */
export const cancelReservation = async (reservationId) => {
  return api.post(`/reservations/${reservationId}/cancel`); // POST is often used for state changes like cancellation.
};

// Export the configured Axios instance as the default export,
// allowing it to be used directly for other API calls not covered by specific functions.
export default api;