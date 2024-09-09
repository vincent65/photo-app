import React from "react";
import ReactDOM from "react-dom";
import { Grid, Typography, Paper } from "@mui/material";
import { HashRouter, Route, Switch } from "react-router-dom";
import {Redirect} from "react-router"

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";

class PhotoShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      advancedFeaturesEnabled: false,
      user: null,
    };
  }
  componentDidMount() {
    this.checkLoginStatus();
  }
  
  checkLoginStatus = async () => {
    try {
      const response = await axios.get("/api/user");
      this.setState({ user: response.data });
      console.log(user);
    } catch (err) {
      this.setState({ user: null });
    }
  };

  handleLogin = (user) => {
    this.setState({user});
    console.log(user);
  }

  handleAdvancedFeaturesToggle = (isEnabled) => {
    this.setState({ advancedFeaturesEnabled: isEnabled });
  }

  render() {
    return (
      <HashRouter>
        <div>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TopBar onAdvancedFeaturesToggle={this.handleAdvancedFeaturesToggle} user = {this.state.user} onLogout={() => this.setState({ user: null })}/>
            </Grid>
            <div className="cs142-main-topbar-buffer" />
            <Grid item sm={3}>
              <Paper className="cs142-main-grid-item">
                {this.state.user ? (<UserList advancedFeaturesEnabled={this.state.advancedFeaturesEnabled}/>) : null}
                
              </Paper>
            </Grid>
            <Grid item sm={9}>
              <Paper className="cs142-main-grid-item">
                <Switch>
                  <Route 
                    path="/login-register" 
                    render={(props) => (
                      <LoginRegister {...props} onLogin={this.handleLogin} />
                    )}
                  />
                {this.state.user ? (
                    <>
                      <Route
                        path="/users/:userId"
                        render={(props) => <UserDetail {...props} />}
                      />
                      <Route
                        path="/photos/:userId"
                        render={(props) => (
                          <UserPhotos
                            {...props}
                            advancedFeaturesEnabled={this.state.advancedFeaturesEnabled}
                          />
                        )}
                      />
                      {/* <Route
                        path="/users"
                        render={(props) => (
                          <UserList
                            {...props}
                            advancedFeaturesEnabled={this.state.advancedFeaturesEnabled}
                          />
                        )}
                      /> */}
                    </>
                  ) : (
                    <Redirect to="/login-register" />
                  )}

                  
                  
                </Switch>
              </Paper>
            </Grid>
          </Grid>
        </div>
      </HashRouter>
    );
  }
}

ReactDOM.render(<PhotoShare />, document.getElementById("photoshareapp"));
