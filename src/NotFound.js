import React, { Component } from 'react';

class NotFound extends Component {
  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    document.title = "HYPE - Not Found"
  }

  goBack = () => {
    this.props.history.goBack();
  }

  render() {
    return (
      <div style={{textAlign: "center"}}>
        <h2 style={{lineHeight: "90vh",fontSize: "4rem", color:"#fff"}}>Nothing is here bucko</h2>
        <a href="#!" className="hype-link" onClick={this.goBack}>Go Back</a>
      </div>
    )
  }
}
  
export default NotFound;