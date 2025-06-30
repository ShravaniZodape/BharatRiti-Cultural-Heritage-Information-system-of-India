const API_BASE_URL = 'http://localhost:3000';

export const fetchHeritageSites = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/heritage-sites`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching heritage sites:', error);
    throw error;
  }
};

export const fetchStates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/states`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching states:', error);
    throw error;
  }
};

