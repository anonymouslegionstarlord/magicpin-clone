import axios from "axios";

const API = axios.create({
    baseURL:
        "https://magicpin-clone-fawn.vercel.app/api"
});

export default API;