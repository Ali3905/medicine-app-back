import {connect} from './db.js';
import {PORT} from './config.js';
import app from './app.js';


connect();


app.get("/", (req, res)=>{
    res.send("hello")
})



app.listen(PORT, () => {
    console.log('Server listening on port 3000', PORT);
    }
);