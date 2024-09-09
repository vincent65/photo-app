import React from "react";
import { CircularProgress, Typography } from "@mui/material";
import { Link } from 'react-router-dom';
import "./styles.css";
import { formatDate } from "../../utils/dateUtils";

import fetchModel from "../../lib/fetchModelData";
import AdvancedPhotoViewer from "../AdvancedPhotoViewer/AdvancedPhotoViewer";
/**
 * Define UserPhotos, a React component of CS142 Project 5.
 */
import axios from "axios";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

class UserPhotos extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: {},
      loading: true,
      users: {},
      newComments: {} // Store new comments for each photo
    }
  }
  componentDidMount(){
    this.fetchPhotos();
  }
    componentDidUpdate(prevProps) {
    if (prevProps.match.params.userId !== this.props.match.params.userId) {
      this.fetchPhotos();
    }
  }

  fetchPhotos = async () => {
    try {
    const response = await axios.get(`/photosOfUser/${this.props.match.params.userId}`);
    const ph= response.data;
    this.setState({ photos: ph });

    // Collect all user IDs from comments
    const userIds = ph.flatMap(photo => 
      photo.comments.map(comment => comment.user_id)
    );

    // Fetch user details
    await this.fetchUserDetails(userIds);
  } catch (error) {
    console.error('Error fetching photos:', error);
  }finally {
    this.setState({ loading : false });  // Set loading to false when done
  }

  }
      
  fetchUserDetails = async (userIds) => {
    console.log("here");
    const uniqueUserIds = [...new Set(userIds)];
    console.log(uniqueUserIds);
  const userPromises = uniqueUserIds.map(id => 
    axios.get(`/user/${id}`)
      .then(response => ({ id, ...response.data }))
  );
  const users = await Promise.all(userPromises);
  const usersObject = users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});
  console.log(usersObject);
  this.setState({ users: usersObject });

};
 addUserDetails = async (userId) => {
    try {
      const response = await axios.get(`/user/${userId}`);
      this.setState(prevState => ({
        users: {
          ...prevState.users,
          [userId]: response.data
        }
      }));
    } catch (error) {
      console.error('Error fetching user details:', error);
    }
  }

handleCommentChange = (photoId, comment) => {
    this.setState(prevState => ({
      newComments: {
        ...prevState.newComments,
        [photoId]: comment
      }
    }));
  }

  handleAddComment = async (photoId) => {
    const comment = this.state.newComments[photoId];
    console.log(comment);
    if (!comment || comment.trim() === '') {
      alert('Comment cannot be empty');
      return;
    }

    try {
      const response = await axios.post(`/commentsOfPhoto/${photoId}`, { comment });
      const newComment = response.data;
      if (!this.state.users[response.data.user_id]) {
        await this.fetchUserDetails(response.data.user_id);
      }
      this.setState(prevState => ({
        photos: prevState.photos.map(photo => 
          photo._id === photoId
            ? { ...photo, comments: [...photo.comments, newComment] }
            : photo
        ),
        newComments: {
          ...prevState.newComments,
          [photoId]: ''
        }
      }));

      // Fetch user details for the new comment
      // await this.fetchUserDetails([newComment.user_id]);
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  }


    generateList2() {
      console.log(this.props);
      let list = this.state.photos;
      let items = [];

      for (let i = 0; i < list.length; i++) {
        let sr = "/images/" + list[i].file_name;
        let date = list[i].date_time;
        let com = list[i].comments;

        let photoContainer = (
          <div className="photo-container">
            <div className="photo">
              <img src={sr} alt={`Photo ${i}`} />
              <div className="photo-date">Uploaded on: {formatDate(date)}</div>
            </div>
            {typeof com !== 'undefined' && (
              <div className="comment-section">
                <h3>Comments</h3>
                <div className="comments-container">
                  {com.map((c, j) => (
                    <div key={j} className="comment-card">
                      <p>
                        <Link to={`/users/${c.user_id}`}>{this.state.users[c.user_id].first_name} {this.state.users[c.user_id].last_name}</Link>{' '}
                        {formatDate(c.date_time)}
                      </p>
                      <p>{c.comment}</p>
                    </div>                    
                  ))}
                </div>
              </div>
            )}
            {typeof com === 'undefined' && (
              <div className="comment-section">
                <h3>Comments</h3>
                <p className="blank">No comments</p>
              </div>
            )}
            <div className="add-comment">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Add a comment..."
                value={this.state.newComments[list[i]._id] || ''}
                onChange={(e) => this.handleCommentChange(list[i]._id, e.target.value)}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.handleAddComment(list[i]._id)}
              >
                Add Comment
              </Button>
            </div>
          </div>
        );

        items.push(photoContainer);
          }

        let retval = <div className="photo-gallery">{items}</div>;
        return retval;
      }

  render() {

    const {advancedFeaturesEnabled} = this.props;
    const { photos, loading } = this.state;

    if(loading){
      return <CircularProgress/>;
    }

    if(advancedFeaturesEnabled && photos.length > 0) {

      const {photos} = this.state;
      return (<AdvancedPhotoViewer photoId = {photos[0]._id} photos={photos} users={this.state.users}/>);
    }
    return (

      <div >
        <div className="user-photos">
          
          {this.generateList2()}
          
        </div>
      </div>
     
    );
  }
}

export default UserPhotos;
