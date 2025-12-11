import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

export default axios.create({
  baseURL: API,
});
