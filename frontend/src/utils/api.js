import axios from "axios";

//Must change the URL when deploy at Heroku
export default axios.create({
    baseURL: "http://localhost:5000",
});