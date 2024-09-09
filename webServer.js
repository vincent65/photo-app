/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'cs142project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the cs142 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */
const session = require("express-session");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const processFormBody = multer({ storage: multer.memoryStorage() }).single(
  "uploadedphoto"
);


const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const async = require("async");

const express = require("express");
const app = express();
app.use(
  session({ secret: "secretKey", resave: false, saveUninitialized: false })
);
app.use(bodyParser.json());
// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
const cs142models = require("./modelData/photoApp.js").cs142models;

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/cs142project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    SchemaInfo.find({}, function (err, info) {
      if (err) {
        // Query returned an error. We pass it back to the browser with an
        // Internal Service Error (500) error code.
        console.error("Error in /user/info:", err);
        response.status(500).send(JSON.stringify(err));
        return;
      }
      if (info.length === 0) {
        // Query didn't return an error but didn't find the SchemaInfo object -
        // This is also an internal error return.
        response.status(500).send("Missing SchemaInfo");
        return;
      }

      // We got the object - return it in JSON format.
      console.log("SchemaInfo", info[0]);
      response.end(JSON.stringify(info[0]));
    });
  } else if (param === "counts") {
    // In order to return the counts of all the collections we need to do an
    // async call to each collections. That is tricky to do so we use the async
    // package do the work. We put the collections into array and use async.each
    // to do each .count() query.
    const collections = [
      { name: "user", collection: User },
      { name: "photo", collection: Photo },
      { name: "schemaInfo", collection: SchemaInfo },
    ];
    async.each(
      collections,
      function (col, done_callback) {
        col.collection.countDocuments({}, function (err, count) {
          col.count = count;
          done_callback(err);
        });
      },
      function (err) {
        if (err) {
          response.status(500).send(JSON.stringify(err));
        } else {
          const obj = {};
          for (let i = 0; i < collections.length; i++) {
            obj[collections[i].name] = collections[i].count;
          }
          response.end(JSON.stringify(obj));
        }
      }
    );
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", function (request, response) {
  if (!request.session.user) {
    return response.status(400).json({ error: "User is not logged in" });
  }
  console.log("/user/list called");
  User.find({}, function (err, users) {
    if(err){
      console.error('Error fetching user list',  err);
      response.status(500).json({error : 'Server Error'});
      return;
    }
    else{
      console.log(users);
      console.log(typeof users);
      response.json(users);
    }
  });
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", function (request, res) {
  if (!request.session.user) {
    return res.status(400).json({ error: "User is not logged in" });
  }
  let id = request.params.id;
  console.log(`/user/${id} called`);
  User.findById(id, function (err, user) {
    if(err){
      console.error("Error fetching user details:", err);
      if (err.name === "CastError") {
        // This error occurs if the ID format is invalid
        res.status(400).json({ error: "Invalid user ID format" });
      } else {
        res.status(500).json({ error: "Server error" });
      }
      return;
    }
    if(!user){
      res.status(404).json({error: 'User not found'});
      return;
    }
    console.log(user);
    res.json(user);
  });

});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", function (request, response) {
  if (!request.session.user) {
    return response.status(400).json({ error: "User is not logged in" });
  }
  let id = request.params.id;
  console.log(`/photosOfUser/${id} called`);
  Photo.find({user_id: id}, function(err, photos) {
    if(err){
      console.error("Error fetching user photos:", err);
      return;
    }
    console.log(photos);
    const processedPhotos = photos.map((photo) => ({
      _id: photo._id,
      user_id: photo.user_id,
      comments: photo.comments.map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user_id: comment.user_id,
      })),
      file_name: photo.file_name,
      date_time: photo.date_time,
    }));

    response.json(processedPhotos);
  });

});

app.get("/getAllPhotos", function(request, response) {
      if (!request.session.user) {
        return response.status(400).json({ error: "User is not logged in" });
      }
    console.log("/getAllPhotos called");
    Photo.find({}, function (err, photos) {
      if (err) {
        console.error("Error fetching Photo list", err);
        response.status(500).json({ error: "Server Error" });
        return;
      } else {
        const processedPhotos = photos.map((photo) => ({
          _id: photo._id,
          user_id: photo.user_id,
          comments: photo.comments.map((comment) => ({
            _id: comment._id,
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: comment.user_id,
          })),
          file_name: photo.file_name,
          date_time: photo.date_time,
        }));

        response.json(processedPhotos);
      }
    });
});

app.post('/admin/login', function(req, res) {
     const { login_name, password } = req.body;
     console.log("/admin/login called");
     User.findOne({login_name: login_name, password: password}, function (err, user) {
        if (err) {
          console.error("Error fetching user details:", err);
          if (err.name === "CastError") {
            // This error occurs if the ID format is invalid
            res.status(400).json({ error: "Invalid user ID format" });
          } else {
            res.status(500).json({ error: "Server error" });
          }
          return;
        }
        if (!user) {
          res.status(404).json({ error: "Username not found or incorrect password" });
          return;
        }
        console.log(user);
        req.session.user = {_id: user._id, first_name: user.first_name};
        res.json({_id: user._id, first_name: user.first_name});
     });
});

app.post("/user", function (req, res) {
  const { firstName, lastName, location, description, occupation, login_name, password } = req.body;
  console.log("/admin/register called");
  


  const new_user = new User({
    first_name: firstName,
    last_name: lastName,
    location: location,
    description: description,
    occupation: occupation,
    login_name: login_name,
    password: password,
  });

  new_user.save((err) => {
        if (err) {
          console.error("Database save error:", err);
          return res
            .status(500)
            .send({ error: "Failed to register user" });
        }

        // Successfully uploaded and saved the user
        res
          .status(200)
          .send({ success: true, message: "User registered successfully" });
    });

});

app.post('/admin/logout', function(req, res) {
  console.log('/admin/logout called');
  if(!req.session.user) {
      return res.status(400).json({error: "User is not logged in"});
  }
  req.session.destroy();
  res.json({message: "Logout successful"});
});

app.get('/api/user', function(req, res) {
    console.log('verify user');
    if(!req.session.user){
      return res.status(401).json({error: "unauthorized"});
    }
    res.json(req.session.user);
});

app.post("/commentsOfPhoto/:photo_id", (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;

  console.log("Received request:", { photo_id, comment }); // Debug log

  if (!comment || typeof comment !== "string" || comment.trim() === "") {
    console.log("Invalid comment:", comment); // Debug log
    return res
      .status(400)
      .json({ error: "Comment must be a non-empty string" });
  }

  if (!req.session.user || !req.session.user._id) {
    console.log("No user session:", req.session); // Debug log
    return res.status(401).json({ error: "User must be logged in to comment" });
  }

  Photo.findById(photo_id, (err, photo) => {
    if (err) {
      console.error("Error finding photo:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!photo) {
      console.log("Photo not found:", photo_id); // Debug log
      return res.status(404).json({ error: "Photo not found" });
    }

    const newComment = {
      comment: comment.trim(),
      user_id: req.session.user._id,
      date_time: new Date(),
    };

    photo.comments.push(newComment);

    photo.save((saveErr) => {
      if (saveErr) {
        console.error("Error saving photo:", saveErr);
        return res.status(500).json({ error: "Internal server error" });
      }

      console.log("Comment added successfully:", newComment); // Debug log
      res.status(201).json(newComment);
    });
  });
});

app.post("/photos/new", (request, response) => {
  processFormBody(request, response, function (err) {
    if (err || !request.file) {
      return response.status(400).send({ error: "No file uploaded" });
    }

    // Extract the relevant info from the request
    const userId = request.session.user._id; // Assuming user session is stored
    const originalName = request.file.originalname;
    const timestamp = new Date().valueOf();
    const uniqueFileName = "U" + String(timestamp) + originalName;

    // Validate that the file is an image
    if (
      !["image/jpeg", "image/png", "image/gif"].includes(request.file.mimetype)
    ) {
      return response.status(400).send({ error: "Invalid file type" });
    }

    // Write the file to the "images" directory
    const imagePath = path.join(__dirname, "images", uniqueFileName);
    fs.writeFile(imagePath, request.file.buffer, (err) => {
      if (err) {
        console.error("File writing error:", err);
        return response.status(500).send({ error: "Failed to save the file" });
      }

      // Create a new Photo object in the database
      const newPhoto = new Photo({
        user_id: userId,
        file_name: uniqueFileName,
        date_time: new Date(),
        comments: []
      });

      // Save the photo metadata in the database
      newPhoto.save((err) => {
        if (err) {
          console.error("Database save error:", err);
          return response
            .status(500)
            .send({ error: "Failed to save photo metadata" });
        }

        // Successfully uploaded and saved the photo
        response
          .status(200)
          .send({ success: true, message: "Photo uploaded successfully" });
      });
    });
  });
});



const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
