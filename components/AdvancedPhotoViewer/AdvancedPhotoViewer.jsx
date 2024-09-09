import React from 'react';
import { withRouter } from 'react-router-dom';
import Button from '@material-ui/core/Button';
// import ArrowBackIcon from '@material-ui/icons/ArrowBack';
// import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { formatDate } from '../../utils/dateUtils';
import { Link } from 'react-router-dom';

class AdvancedPhotoViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPhotoIndex: 0
    };
  }

  componentDidMount() {
    this.updatePhotoIndex();

    window.addEventListener('popstate', this.handlePopState);
  }
  componentWillUnmount() {
    window.removeEventListener('popstate', this.handlePopState);
  }

    handlePopState = () => {
    this.updatePhotoIndex();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.photoId !== this.props.photoId) {
      this.updatePhotoIndex();
    }
  }
   updatePhotoIndex = () => {
    const { photos, photoId } = this.props;
    console.log(photoId);

    if (photoId && photos.length > 0) {
      const index = photos.findIndex(photo => photo._id === photoId);
      if (index !== -1) {
        this.setState({ currentPhotoIndex: index });
      }
    }
  }

  handleStepForward = () => {
    const { photos } = this.props;
    const newIndex = Math.min(this.state.currentPhotoIndex + 1, photos.length - 1);
    this.navigateToPhoto(this.state.currentPhotoIndex);
    this.setState({currentPhotoIndex: newIndex});
  }

  handleStepBackward = () => {
    const newIndex = Math.max(this.state.currentPhotoIndex - 1, 0);
    this.navigateToPhoto(this.state.currentPhotoIndex);
    this.setState({currentPhotoIndex: newIndex});
    
  }

  navigateToPhoto = (index) => {
    const { photos, history, match } = this.props;
    const currentPhoto = photos[index];
    console.log(history);
    this.props.history.push(`/photos/${currentPhoto.user_id}/${currentPhoto._id}`);
  }

  render() {
    const { photos } = this.props;
    const { users} = this.props;
    const currentPhoto = photos[this.state.currentPhotoIndex];
    // console.log(photos);
    return (
         <div className="photo-container">
            <div className="photo">
              <img src={`/images/${currentPhoto.file_name}`} alt={`Photo`} />
              <div className="photo-date">Uploaded on: {formatDate(currentPhoto.date_time)}</div>
            </div>
            {typeof currentPhoto.comments !== 'undefined' && (
              <div className="comment-section">
                <h3>Comments</h3>
                <div className="comments-container">
                  {currentPhoto.comments.map((c, j) => (
                    <div key={j} className="comment-card">
                      <p>
                        <Link to={`/users/${c.user_id}`}>{users[c.user_id].first_name} {users[c.user_id].last_name}</Link>{' '}
                        {formatDate(c.date_time)}
                      </p>
                      <p>{c.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {typeof currentPhoto.comments === 'undefined' && (
              <div className="comment-section">
                <h3>Comments</h3>
                <p className="blank">No comments</p>
              </div>
            )}
              <Button
            onClick={this.handleStepBackward}
            disabled={this.state.currentPhotoIndex === 0}
            // startIcon={<ArrowBackIcon />}
          >
            Previous
          </Button>
          <Button
            onClick={this.handleStepForward}
            disabled={this.state.currentPhotoIndex === photos.length - 1}
            // endIcon={<ArrowForwardIcon />}
          >
            Next
          </Button>

          </div>
          
  
    );
  }
}

export default withRouter(AdvancedPhotoViewer);