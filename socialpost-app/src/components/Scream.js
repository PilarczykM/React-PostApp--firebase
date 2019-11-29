import React, { Component } from "react";
import Link from "react-router-dom/Link";

// Mui stuff
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";

class Scream extends Component {
  render() {
    const {
      scream: {
        body,
        createdAt,
        userImage,
        userHandle,
        likeCount,
        commentCount
      }
    } = this.props;

    return (
      <Card className="card">
        <CardMedia className="media" image={userImage} title="Profile image" />
        <CardContent>
          <Typography
            color="primary"
            variant="h5"
            component={Link}
            to={`/users/${userHandle}`}
          >
            {userHandle}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {createdAt}
          </Typography>
          <Typography variant="body1">{body}</Typography>
        </CardContent>
      </Card>
    );
  }
}

export default Scream;
