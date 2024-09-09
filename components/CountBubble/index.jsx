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

class CountBubble extends React.Component {
    render (){
        return (
            <div>Implement the section where you can see what the user has commented</div>
        )
    }
}

export default CountBubble;