import api from './api';

const getMyVehicles = () => {
  return api.get('/vehicles');
};

const addVehicle = (data) => {
  return api.post('/vehicles', data);
};

const updateVehicle = (id, data) => {
  return api.put(`/vehicles/${id}`, data);
};

const deleteVehicle = (id) => {
  return api.delete(`/vehicles/${id}`);
};

const vehicleService = {
  getMyVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle,
};

export default vehicleService;
