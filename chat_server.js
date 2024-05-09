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

function generate_food_type() {
    const foodtype = {
            cake:{ name:"cake" , effect:1 },
            fruit:{ name:"fruit" , effect:1 },
            battery : { name:"battery" , effect:-1 }
        };
        const foodtypeKey = Object.keys(foodtype)
        const random = Math.floor(Math.random() * foodtypeKey.length);
        const randomFoodtypeKey = foodtypeKey[random];
        const randomFoodtype = foodtype[randomFoodtypeKey];
        io.emit("food type generated", randomFoodtype);
};

function start(){
	allow_to_eat = true;
	io.emit("start");
	end_timeout = setTimeout( ()=>{
		io.emit("no one eat");
		rest(3000);
		},4000); // 4000 is the time the cover open
};

function rest(time){
	io.emit("rest");
	const timeout = setTimeout(start,time);
	const foodtimeout = setTimeout(generate_food_type,time-1000);
	return {timeout , foodtimeout} ; 
};

function restforever(){
    clearTimeout(end_timeout);
	rest_timeout = rest(4000);
	start_timeout = rest_timeout.timeout;
	generate_food_timeout = rest_timeout.foodtimeout;
	clearTimeout(start_timeout);
	clearTimeout(generate_food_timeout);

};


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
let food_already_generated = false;
let allow_to_eat = false;
let end_timeout;
let start_timeout;
let generate_food_timeout;
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
        // add the usr into the list of online user
        onlineUserList[username] = user;
        //console.log("onlineUserList",onlineUserList);
        availableUserList[username] = user;
        socket.emit("own information", JSON.stringify(user));
        //console.log("availableUserList",availableUserList);
        //console.log(onlineUserList);
        // help everyone to update even for those who already connected to servr
        //io.emit('add user', JSON.stringify(user)); // not use socket but io because socket is dedicate to each user but io is for broadcasting
    }

    //when user sign out, disconnect but still in this connection event as we still need to use this socket variable from the connection event  
    socket.on("disconnect",()=>{
        console.log("is disconnected!!!!");
        if (socket.request.session.user) { // if this information exist get the use's information
            user = socket.request.session.user;   // this also make use of   user = json.user; // theis will also display user name on right hand corner
            const { username, name } = user; 
            console.log(username+"is disconnected!!!!");

            if (onlineUserList[username]){ // if the user is in the current online user list
                delete onlineUserList[username];
                // help everyone to update even for those who already connected to servr
                io.emit('remove user', JSON.stringify(user)); // not use socket but io because socket is dedicate to each user but io is for broadcasting

            }
        }
    });

    // allow newly sign in user to know the existing user
    socket.on("get users", () => { // send to browser(socket)
        if(Object.keys(availableUserList).length >  1){ // there are other user in this list
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
            }        
    });
    

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
			rest(3000);
        }
    });


	socket.on("signal",(username) =>{
		console.log(username);
		if(allow_to_eat){
			allow_to_eat=false;
			////clearTimeout(end_timeout);
			io.emit("update", username);
			//rest_timeout = rest(4000);
			//start_timeout = rest_timeout.timeout;
			//generate_food_timeout = rest_timeout.foodtimeout;
		}
        else{// the food is already eaten by another user 
            io.emit("move back without food", username);  
        }
		
	});	
	
	socket.on("restforever",() =>{
		restforever();
	});



    /*socket.on("update oppo about my move",(oppo_user_name)=>{
        if (sockets[oppo_user_name]){ // if targeted socket exists
            sockets[oppo_user_name].emit("update oppo move and score");
        }
    });

    socket.on("get messages", () => {
        // Send the chatroom messages to the browser
        const chatroom  = JSON.parse(fs.readFileSync("./data/chatroom.json"));
        socket.emit("messages", JSON.stringify(chatroom ));
    });*/

    socket.on("get ranking", (win_username, lose_username, win_name, lose_name, time_used) => {
        // read the game rank records
        const game_rank = JSON.parse(fs.readFileSync("./data/rank.json"));
        if (win_username in game_rank){ // if the player already have ranking record
                number_of_win = game_rank[win_username]["number_of_win"]+1;
                number_of_lose = game_rank[win_username]["number_of_lose"]; 
                if(game_rank[win_username]["average_winning_time"]){ // if it is not null, means this user have won before
                    average_winning_time = ((game_rank[win_username]["average_winning_time"])*(game_rank[win_username]["number_of_win"])+time_used)/number_of_win;
                }
                else{// this player haven't won before
                    average_winning_time = time_used;
                }   
                percentage_winning = number_of_win/(number_of_win+number_of_lose)*100;               
        }
        else{ // create a new ranking for this user who have not had a rank yet
            number_of_win = 1;
            number_of_lose = 0;    
            average_winning_time = time_used;
            percentage_winning = 100;               
        }
        game_rank[win_username]= {name: win_name, number_of_win, number_of_lose, average_winning_time, percentage_winning};  
        if (lose_username in game_rank){ // if the player already have ranking record
            number_of_win = game_rank[lose_username]["number_of_win"];
            number_of_lose = game_rank[lose_username]["number_of_lose"]+1;  
            average_winning_time = game_rank[lose_username]["average_winning_time"]; 
            percentage_winning = number_of_win/(number_of_win+number_of_lose)*100;               
        }
        else{ // create a new ranking for this user who have not had a rank yet
         
                       number_of_win = 0;number_of_lose = 1;  
                average_winning_time = null; // the user never win
                percentage_winning = 0;               
        }
        // Add or update these users in game_rank
        game_rank[lose_username]= {name: lose_name, number_of_win, number_of_lose, average_winning_time, percentage_winning};  
        //Object.entries() is used for listing properties related to an object, listing all the [key, value] pairs of an object
        // E.g. const obj = { 10: 'adam', 200: 'billy', 35: 'chris' }; console.log(Object.entries(obj)); => [ [ '10', 'adam' ], [ '35', 'chris' ], [ '200', 'billy' ] ]
        let game_rank_list = Object.entries(game_rank);
        // Define the ranking criteria
        function comparePlayers(a_value, b_value) {
            let a = a_value[1]; //the dict of values where 0 is key
            let b = b_value[1]; //the dict of values where 0 is key
            // Compare by percentage winning in descending order
            if (a.percentage_winning > b.percentage_winning) {
              return -1;
            } else if (a.percentage_winning < b.percentage_winning) {
              return 1;
            }
            // If percentage of winning is the same
            // if not both of their percentage of winning = zero, compare by average_winning_time in ascending order
            if (a.average_winning_time != null){
                if (a.average_winning_time < b.average_winning_time) {
                    return -1;
                } else if (a.average_winning_time > b.average_winning_time) {
                    return 1;
                }
            }   
            // If both of their percentage of winning = zero or both have equal percentage of winning as well as average_winning_time, return 0 (equal ranking)
            return 0; //equal ranking
        };
        // Sort the JSON elements based on the ranking criteria
        game_rank_list.sort(comparePlayers);
        // turn the list of key-value pairs back to dictionary
        let sorted_game_rank = Object.fromEntries(game_rank_list);
        // Print the ranked elements
        for (var key in sorted_game_rank) {
            console.log(sorted_game_rank[key]);
        }
        console.log(sorted_game_rank,game_rank_list);
        // Update the ranking to the rank.json
        fs.writeFileSync("./data/rank.json",JSON.stringify(sorted_game_rank, null, " "));
        // broadcast the ranking results to the two users
        io.emit("ranking result", JSON.stringify(sorted_game_rank)); //JSON.stringify(message) return an object while JSON.stringify(chatroom) return a list
    });
    
    //  This is to generate a food type and broadcast to all user food is generated at server such that both users can see the same food
	
/*
    socket.on("generate food type", () => { 
        //  Broadcast the type of food being generated to all playes 
        const foodtype = {
            cake:{ name:"cake" , effect:1 },
            fruit:{ name:"fruit" , effect:1 },
            battery : { name:"battery" , effect:-1 }
        };
        const foodtypeKey = Object.keys(foodtype)
        const random = Math.floor(Math.random() * foodtypeKey.length);
        const randomFoodtypeKey = foodtypeKey[random];
        const randomFoodtype = foodtype[randomFoodtypeKey];
        io.emit("food type generated", randomFoodtype);

    });
   
    //  This is to generate a food type due to timeout but not eaten by player and broadcast to all user food is generated at server such that both users can see the same food
    socket.on("generate food type due to timeout", () => {
        console.log(food_already_generated); 
        if (!food_already_generated){ // no one have notify the server about the timeout yet
            
            //  Broadcast the type of food being generated to all playes 
            food_already_generated = true;
            const foodtype = {
                cake:{ name:"cake" , effect:1 },
                fruit:{ name:"fruit" , effect:1 },
                battery : { name:"battery" , effect:-1 }
            };
            const foodtypeKey = Object.keys(foodtype)
            const random = Math.floor(Math.random() * foodtypeKey.length);
            const randomFoodtypeKey = foodtypeKey[random];
            const randomFoodtype = foodtype[randomFoodtypeKey];
            io.emit("food type generated", randomFoodtype);
            console.log("food type generated", randomFoodtype);
        }
        else{ // another player already notify the server about the timeout and to update the food
            food_already_generated = false;
        }
    });
*/
    socket.on("available to match with another user", (user_name) => {
        if(sockets[user_name]){ // this user exists in socket list (in general should be true)
            if(onlineUserList[user_name]){ // this user exists in onlineUser list (in general should be true)
                user = socket.request.session.user;
                // add the user to avialble list as it is availabe again
                availableUserList[user_name] = user;    
                socket.emit("added to available list"); 
                console.log("added to available list",availableUserList,user_name)   
            } 
        }
    });

});



// Use a web server to listen at port 8000
httpServer.listen(8000, () => { //switch from app to httpServer because our express server is changed to httpServer
    console.log("The chat server has started...");
});
