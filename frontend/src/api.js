import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

export default axios.create({
  baseURL: API_BASE,
});
