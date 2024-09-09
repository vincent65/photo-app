import React from "react";
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
  Badge,
} from "@mui/material";
// import Link from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

import { HashRouter, Route, Switch } from "react-router-dom";
import ReactDOM from "react-dom";
import { Link } from 'react-router-dom';
import "./styles.css";
import axios from 'axios';

/**
 * Define UserList, a React component of CS142 Project 5.
 */
class UserList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      photoCounts: {},
      commentCounts: {},
      loading: true,
    };
  }

  componentDidMount(){
    this.fetchUsers();
  }
  fetchUsers = async () => {
   try {
      const response = await axios.get('/user/list');
      this.setState({ users: response.data }, () => {
        this.fetchPhotoAndCommentCounts();
      });
    } catch (error) {
      console.error('Error fetching user list: ', error);
    } finally {
      this.setState({ loading: false });
    }
  }
 fetchPhotoAndCommentCounts = async () => {
    const { users } = this.state;
    const photoCounts = {};
    const commentCounts = {};


    for (const user of users) {
      try {
        const photoResponse = await axios.get(`/photosOfUser/${user._id}`);
        photoCounts[user._id] = photoResponse.data.length;
        
        const photos = photoResponse.data;

        for(const photo of photos) {
          if(photo.comments){
            for(const comment of photo.comments) {
              commentCounts[comment.user_id] = (commentCounts[comment.user_id] || 0) + 1;
            }
          }
        }
        
      } catch (error) {
        console.error(`Error fetching data for user ${user._id}:`, error);
      }
    }

    this.setState({ photoCounts, commentCounts });
  }

  renderList = () => {
    const {users, photoCounts, commentCounts} = this.state;
    const {advancedFeaturesEnabled} = this.props
    return (
      <List component="nav">
        {users.map((user, index) => (
          <React.Fragment key={user._id}>
            <ListItem component={Link} to={`/users/${user._id}`} button>
              <ListItemText primary={`${user.first_name} ${user.last_name}`} />

             {advancedFeaturesEnabled && (
            <>
              <Badge 
                badgeContent={photoCounts[user._id] || 0} 
                color="success" 
                sx={{ marginRight: 2 }}
              >
                <Typography variant="body2">Photos</Typography>
              </Badge>
              <Badge 
                badgeContent={commentCounts[user._id] || 0} 
                color="error"
              >
                <Typography variant="body2">Comments</Typography>
              </Badge>
            </>
          )}
            </ListItem>
            {index < users.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );

  }

  render() {

    if(this.state.loading){
      return <Typography>Loading ...</Typography>
    }

    return (

      <div>
        <div>{this.renderList()}</div>
       
      </div>
    );
  }
}

export default UserList;
