import axios from 'axios';


async function getSimulationData() {
    const response = await axios.get('assets/simulationData.json');
    return response;
}

function getDistricts() {
    return axios.get("assets/district.json");
}

export default { getSimulationData, getDistricts };