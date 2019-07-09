import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class Square extends React.Component {
  renderSquare() {
    let className = 'square';
    if (this.props.wonLines.includes(this.props.index)) {
      className += ' won';
    }
    var square = <button className={className} onClick={this.props.onClick}>
      {this.props.value}
    </button>;

    return square;
  }

  render() {
    return this.renderSquare();
  }
}

class Board extends React.Component {

  renderRows() {
    var rows = [];
    for (let i = 0; i < 3; i++) {
      let childSquares = [];
      for (let j = 0; j < 3; j++) {
        childSquares.push(this.renderSquare((i * 3) + j))
      }
      rows.push(<div key={i} className="board-row">{childSquares}</div>)
    }
    return rows;
  }

  renderSquare(i) {
    return <Square
      key={i}
      index={i}
      value={this.props.squares[i]}
      wonLines={this.props.wonLines}
      onClick={() => this.props.onClick(i)}
    />;
  }

  render() {
    return (
      <div>
        {this.renderRows()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.jumpTo = this.jumpTo.bind(this);
    this.toggleSorting = this.toggleSorting.bind(this);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        location: [0, 0]
      }],
      sortAsc: true,
      stepNumber: 0,
      xIsNext: true
    }
  }
  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        location: [Math.floor(i / 3), i % 3]
      }]),
      sortAsc: this.state.sortAsc,
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });
  }

  jumpTo(e, step) {
    var targetOl = e.target.parentElement.parentElement;
    for (let i = 0; i < targetOl.childNodes.length; i++) {
      const element = targetOl.childNodes[i];
      element.classList.remove('selected');

    }
    var targetLi = e.target.parentElement;
    targetLi.classList.add('selected');
    this.setState({
      sortAsc: this.state.sortAsc,
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleSorting() {
    this.setState({
      history: this.state.history,
      sortAsc: !this.state.sortAsc,
      stepNumber: this.state.stepNumber,
      xIsNext: this.state.xIsNext
    })
  }

  render() {
    let history = this.state.history;
    if (!this.state.sortAsc) {
      history = this.state.history.reverse();
    }
    const current = history[this.state.stepNumber];
    const result = calculateWinner(current.squares);
    let wonLines = [];
    const moves = history.map((step, move) => {
      const desc = move ?
        'Go to move #' + move + ' (loc: ' + step.location + ')' :
        'Go to game start';
      return (
        <li key={move}>
          <button onClick={(e) => this.jumpTo(e, move)}>{desc}</button>
        </li>
      );
    });

    let status;
    if (result) {
      status = 'Winner: ' + result.winner;
      wonLines = result.line;
    } else {
      if (current.squares.some(s => s === null)) {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
      else {
        status = 'Draw';
      }
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            wonLines={wonLines}
            onClick={(i) => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={this.toggleSorting}>Toggle Sorting</button>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: lines[i] };
    }
  }
  return null;
}