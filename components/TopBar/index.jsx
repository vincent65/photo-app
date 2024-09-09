import React, {useState, useEffect} from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { Link, useLocation} from 'react-router-dom';
import "./styles.css";
import { withRouter } from 'react-router-dom';
import fetchModel from "../../lib/fetchModelData";
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import axios from "axios";
/**
 * Define TopBar, a React component of CS142 Project 5.
 */

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageTitle: 'Photo Gallery',
      versionNumber: '',
      advancedFeaturesEnabled: false,
      userName: '',
      uploadInput : React.createRef()
    };
    this.handleLogout = this.handleLogout.bind(this);
    this.handleUploadButtonClicked = this.handleUploadButtonClicked.bind(this);
  }
    async handleLogout() {
    try {
      await axios.post('/admin/logout');
      // Update application state to indicate user is logged out
      // You might want to call a function passed as a prop to update the parent component's state
      if (this.props.onLogout) {
        this.props.onLogout();
      }
    } catch (err) {
      console.error(err);
    }
  }

   handleAdvancedFeaturesToggle = (event) => {
    const isEnabled = event.target.checked;
    this.setState({ advancedFeaturesEnabled: isEnabled });
    this.props.onAdvancedFeaturesToggle(isEnabled);
  }

  componentDidMount() {
    this.updatePageTitle(this.props.location.pathname);
    this.fetchVersionNumber();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.updatePageTitle(this.props.location.pathname);
    }
  }

    fetchFirstName = (id) => {
    return axios.get(`/user/${id}`)
      .then(response => {
        console.log(response.data.first_name);
        return response.data.first_name;
      })
      .catch(error => {
        console.error('Error fetching user name:', error);
        return '';
      });
  }

  fetchVersionNumber = () => {
    axios.get('/test/info')
      .then(response => {
        this.setState({ versionNumber: response.data.__v });
      })
      .catch(error => {
        console.error('Error fetching version number:', error);
      });
  }

  updatePageTitle = async (pathname) => {

     const parts = pathname.split('/');
    let newTitle = '';
    let userName = '';

    if (parts[1] === 'users' || parts[1] === 'photos') {
      userName = await this.fetchFirstName(parts[2]);
    }

    if (parts[1] === 'users') {
      newTitle = userName;
    } else if (parts[1] === 'photos') {
      newTitle = `${userName}'s Photos`;
    }

    this.setState({ pageTitle: newTitle, userName: userName });
  };
  
  handleUploadButtonClicked = (e) => {
    e.preventDefault();
    if (this.uploadInput.files.length > 0) {
      // Create a DOM form and add the file to it under the name 'uploadedphoto'
      const domForm = new FormData();
      domForm.append('uploadedphoto', this.uploadInput.files[0]);

      axios.post('/photos/new', domForm)
        .then((res) => {
          console.log(res);
          alert('Photo uploaded successfully');
        })
        .catch((err) => {
          console.error(`POST ERR: ${err}`);
          alert('Photo upload failed');
        });
    }

  };

  render() {
    const {user} = this.props;

    return (
      <AppBar className="cs142-topbar-appBar" position="absolute">
      <Toolbar
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <a href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
          {user ? ( <><Typography variant="h6">Hi, {user.first_name}</Typography> <button onClick={this.handleLogout}>Logout</button></>) : (<Typography variant="h6"> Please Login</Typography>)}
        </a>

        {!user ? (null) : (<>
                     {/* File input for selecting a photo */}

              <input
                type="file"
                accept="image/*"
                ref={(domFileRef) => { this.uploadInput = domFileRef; }}
              />

              {/* Upload button */}
              <button variant="contained" onClick={this.handleUploadButtonClicked}>
                Upload Photo
              </button>

        <FormControlLabel
          control={
            <Checkbox
              checked={this.state.advancedFeaturesEnabled}
              onChange={this.handleAdvancedFeaturesToggle}
              color="primary"
            />
          }
          label="Enable Advanced Features"
        />
        <Typography variant="subtitle1">Version: {this.state.versionNumber}</Typography>
        <Typography variant="h6">{this.state.pageTitle}</Typography></>)}
        
         
      </Toolbar>
      </AppBar>
    );
  }
}

export default withRouter(TopBar);

