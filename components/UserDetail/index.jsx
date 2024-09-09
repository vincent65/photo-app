import React from "react";
import { Typography } from "@mui/material";
import { Link } from 'react-router-dom';

import "./styles.css";

import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';

import Button from '@mui/material/Button';
import fetchModel from "../../lib/fetchModelData";
import { withRouter } from 'react-router-dom';
import axios from 'axios';
/**
 * Define UserDetail, a React component of CS142 Project 5.
 */



class UserDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user_info : {}
    }
  }

  componentDidMount(){
    this.fetchUser();
  }
   componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.fetchUser();
    }
  }
  fetchUser = () => {
    axios.get(`/user/${this.props.match.params.userId}`)
      .then(response => {
        this.setState({ user_info: response.data });
        // console.log(response.data);
        // console.log(this.props.match.params.userId);
      })
      .catch(error => {
        console.error('Error fetching user:', error);
      });
  }

  render() {
    return (
      <div className="user-detail">
    
        <Box sx={{ minWidth: 275 }}>
          <Card variant="outlined">

            <React.Fragment>
              <CardContent>
                <h2>{this.state.user_info.first_name} {this.state.user_info.last_name}</h2>
                <p>Location: {this.state.user_info.location}</p>
                <p>Description: {this.state.user_info.description}</p>
                <p>Occupation: {this.state.user_info.occupation}</p>

                {/* <h2>{window.cs142models.userModel(this.props.match.params.userId).first_name}</h2>
                <p>Location: {window.cs142models.userModel(this.props.match.params.userId).location}</p>
                <p>Description: {window.cs142models.userModel(this.props.match.params.userId).description}</p>
                <p>Occupation: {window.cs142models.userModel(this.props.match.params.userId).occupation}</p> */}

              </CardContent>

              <CardActions>
                <Link to={{pathname: `/photos/${this.props.match.params.userId}`}} ><Button variant="contained" size="small">See Photos</Button></Link>
                
              </CardActions>
            </React.Fragment>

          </Card>
        </Box>
                
      </div>
      // <Typography variant="body1">
      //   This should be the UserDetail view of the PhotoShare app. Since it is
      //   invoked from React Router the params from the route will be in property
      //   match. So this should show details of user:
      //   {this.props.match.params.userId}. You can fetch the model for the user
      //   from window.cs142models.userModel(userId).
      // </Typography>
    );
  }
}

export default withRouter(UserDetail);
