class Comment {
  constructor(name, comment, date) {
    this.name = name;
    this.comment = comment;
    this.date = date;
  }

  toHTML() {
    const [date, time] = new Date(this.date).toLocaleString().split(',');
    return `<tr>
        <td>${date}</td>
        <td>${time}</td>
        <td>${this.name}</td>
        <td>${this.comment}</td>
     </tr>`;
  }
}

class Comments {
  constructor() {
    this.comments = [];
  }

  addComment(comment) {
    this.comments.push(comment);
  }

  toHTML() {
    return this.comments
      .map(comment => comment.toHTML())
      .reverse()
      .join('');
  }

  static load(content) {
    const commentList = JSON.parse(content);
    const comments = new Comments();
    commentList.forEach(commentElement => {
      comments.addComment(
        new Comment(
          commentElement.name,
          commentElement.comment,
          new Date(commentElement.time)
        )
      );
    });
    return comments;
  }

  toJSON() {
    return JSON.stringify(this.comments);
  }
}

module.exports = { Comment, Comments };
