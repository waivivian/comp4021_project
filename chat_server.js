const express = require("express");

const bcrypt = require("bcrypt");
const fs = require("fs");
const session = require("express-session");

// Create the Express app
const app = express();

// Use the 'public' folder to serve static files
app.use(express.static("public"));

// Use the json middleware to parse JSON data
app.use(express.json());

// Use the session middleware to maintain sessions
const chatSession = session({
    secret: "game",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 300000 }
});
app.use(chatSession);

// This helper function checks whether the text only contains word characters
function containWordCharsOnly(text) {
    return /^\w+$/.test(text);
}

// Handle the /register endpoint
app.post("/register", (req, res) => {
    // Get the JSON data from the body (read from user input)
    let { username, name, password } = req.body;

    //
    // D. Reading the users.json file (read from backend (our database))
    //
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    //
    // E. Checking for the user data correctness
    //
    if (!username || !name || !password ){
        let error_field = "";
        if (!username){
            error_field += "Username ";
        }
        if (!name){
             error_field += "Name ";
        }
        if (!password){
             error_field += "Password ";
        }
        res.json({
            status: "error",
            error:  error_field+"field cannot be empty!"
        });

        return; //as the whole process will end immediately
    }
    console.log(containWordCharsOnly(username));
    if (!containWordCharsOnly(username)){
        res.json({
            status: "error",
            error: "Username should not contain non-word character!"
        });
        return; //as the whole process will end immediately
    }

    if (username in users){
        res.json({
            status: "error",
            error: "username exists"
        });
        return; //as the whole process will end immediately
    }

    //
    // G. Adding the new user account
    //
    const hash =bcrypt.hashSync(password, 10); //we need to hash it else it is not safe
    password = hash
    users[username]= {name, password};
    console.log(users[username]);
    //
    // H. Saving the users.json file
    //
    fs.writeFileSync("./data/users.json",JSON.stringify(users, null, " "));

    //
    // I. Sending a success response to the browser
    //
    res.json({ status: "success"});

    // Delete when appropriate
    //res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signin endpoint
app.post("/signin", (req, res) => {
    // Get the JSON data from the body
    const { username, password } = req.body;

    //
    // D. Reading the users.json file
    //
    const users = JSON.parse(fs.readFileSync("./data/users.json"));
    //
    // E. Checking for username/password
    //
    if (!(username in users)){
        res.json({
            status: "error",
            error: "username not exits"
        });
        return; //as the whole process will end immediately
    }
    const hashedPassword = users[username]["password"]; // here the key is "password" instead of just password
    /* a hashed password stored in users.json */;
    if (!bcrypt.compareSync(password, hashedPassword)) {
    /* Passwords are not the same */
        res.json({
            status: "error",
            error: "wrong password"
        });
        return; //as the whole process will end immediately
    }
    //Before returning the success response, you need to put the user account into the current session
    req.session.user = {
        username: username,
        name: users[username]["name"]
        
    }/* user account */;
    //
    // G. Sending a success response with the user account
    //
    res.json({ status: "success", 
        user:{
            username: username,
            name: users[username]["name"]
        
        }
    });

    // Delete when appropriate
    //res.json({ status: "error", error: "This endpoint is not yet implemented." });
});
// Handle the /validate endpoint
app.get("/validate", (req, res) => {

    //
    // B. Getting req.session.user
    //
    
    if (req.session.user === undefined) {
        /////////////////////////////////i don't know when to have error
        res.json({
            status: "error",
            error: "username not exits"
        });
        return ;
    }
    let { username, name } = req.session.user;

    //
    // D. Sending a success response with the user account
    //
    res.json({ status: "success", 
        user:{
            username: username,
            name: name
        
        }
    });
    // Delete when appropriate
    //res.json({ status: "error", error: "This endpoint is not yet implemented." });
});

// Handle the /signout endpoint
app.get("/signout", (req, res) => {

    //
    // Deleting req.session.user
    //
    delete req.session.user;
    //
    // Sending a success response
    //
    res.json({ status: "success"});
    // Delete when appropriate
    //res.json({ status: "error", error: "This endpoint is not yet implemented." });
});


//
// ***** Please insert your Lab 6 code here *****
//
const { createServer } = require("http");
const { Server } = require("socket.io");
const httpServer = createServer(app); // switch from app to httpServer as our express server 
const io = new Server(httpServer); 
const onlineUserList = {};
const availableUserList = {};
const sockets = {}; //maintain a list of sockets

io.use((socket, next) => { //for socket server it doesn't use session if you don't ask for it, we need to explictly ask for the session
    chatSession(socket.request, {}, next);
});

//create a connection when someone sign in
io.on("connection", (socket) => {   //this socket is browser
    let user = null; 
    if (socket.request.session.user) { // if this information exist get the use's information
        user = socket.request.session.user;
        const { username, name } = user;   
        sockets[username]=socket;
        //console.log("sockets",sockets);
        // add the usr into the list of online user
        onlineUserList[username] = user;
        //console.log("onlineUserList",onlineUserList);
        availableUserList[username] = user;
        //console.log("availableUserList",availableUserList);
        //console.log(onlineUserList);
        // help everyone to update even for those who already connected to servr
        //io.emit('add user', JSON.stringify(user)); // not use socket but io because socket is dedicate to each user but io is for broadcasting
    }

    //when user sign out, disconnect but still in this connection event as we still need to use this socket variable from the connection event  
    socket.on("disconnect",()=>{
        if (socket.request.session.user) { // if this information exist get the use's information
            user = socket.request.session.user;   // this also make use of   user = json.user; // theis will also display user name on right hand corner
            const { username, name } = user; 
            if (onlineUserList[username]){ // if the user is in the current online user list
                delete onlineUserList[username];
                // help everyone to update even for those who already connected to servr
                io.emit('remove user', JSON.stringify(user)); // not use socket but io because socket is dedicate to each user but io is for broadcasting

            }
        }
    });

    if(Object.keys(availableUserList).length >  1){ // there are other user in this list
        // allow newly sign in user to know the existing user
        socket.on("get users", () => { // send to browser(socket)
            user = socket.request.session.user;   // this also make use of   user = json.user; // theis will also display user name on right hand corner
            // Send the first available users to the browser

            sockets[user["username"]].emit("users", JSON.stringify(availableUserList[Object.keys(availableUserList)[0]]));
            // Send the current user to the first available users browser
            if(sockets[Object.keys(availableUserList)[0]]){
                sockets[Object.keys(availableUserList)[0]].emit("users",JSON.stringify(user));
            }
 
            delete availableUserList[user['username']]; // delete this user from availableUserList as he/she can find someone to match with
            delete availableUserList[Object.keys(availableUserList)[0]]; // delete this user from availableUserList as he/she can find someone to match with
            //console.log("bye",availableUserList);        



        });
    }

    socket.on("change oppo image",(data)=>{
        const {to, image} = JSON.parse(data);
        if (sockets[to]){ // if targeted socket exists
            sockets[to].emit("update oppo image",image);
        }
    });

    socket.on("chosen character id",(data)=>{
        const {to, selected_character_id} = JSON.parse(data);
        if (sockets[to]){ // if targeted socket exists
            sockets[to].emit("update oppo character id",selected_character_id);
        }
    });

    socket.on("game can start",(data)=>{
        const {to, selected_character_id} = JSON.parse(data);
        if (sockets[to]){ // if targeted socket exists
            sockets[to].emit("start game",selected_character_id);
        }
    });

    
    socket.on("get messages", () => {
        // Send the chatroom messages to the browser
        const chatroom  = JSON.parse(fs.readFileSync("./data/chatroom.json"));
        socket.emit("messages", JSON.stringify(chatroom ));
    });

    socket.on("post message", (content) => {
        //if (content && socket.request.session.user) {

        const message = {
            user: socket.request.session.user   /* { username, avatar, name } */,
            datetime: new Date()/* date and time when the message is posted */,
            content: content /* content of the message */
        };
        const chatroom  = JSON.parse(fs.readFileSync("./data/chatroom.json"));
        chatroom.push(message);
        // Add the message to the chatroom
        fs.writeFileSync("./data/chatroom.json",JSON.stringify(chatroom, null, " "));
        io.emit("add message", JSON.stringify(message)); //JSON.stringify(message) return an object while JSON.stringify(chatroom) return a list
    
        
    //}
    });

        socket.on("type message", () => {
        //  Broadcast to all clients who is typing
        if (socket.request.session.user) {
            io.emit("type message", socket.request.session.user.name);
        }
    });
    




});



// Use a web server to listen at port 8000
httpServer.listen(8000, () => { //switch from app to httpServer because our express server is changed to httpServer
    console.log("The chat server has started...");
});