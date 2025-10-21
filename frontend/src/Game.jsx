
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import CustomDialog from "./components/CustomDialog.jsx";
import socket from "./socket.jsx";

function Game({ players, room, orientation, cleanup }) {
  const [chess] = useState(new Chess());
  const [fen, setFen] = useState(chess.fen());
  const [over, setOver] = useState("");
  const [gameLog, setGameLog] = useState([]);

  const makeAMove = useCallback(
    (move) => {
      try {
        const result = chess.move(move);
        setFen(chess.fen());
        
        // Log the move
        const moveNotation = chess.history({ verbose: true }).slice(-1)[0].san;
        setGameLog(prevLog => [...prevLog, moveNotation]);

        if (chess.isGameOver()) {
          if (chess.isCheckmate()) {
            setOver(`Checkmate! ${chess.turn() === 'w' ? 'black' : 'white'} wins!`);
          } else if (chess.isDraw()) {
            setOver('Draw');
          } else {
            setOver('Game over');
          }
        }
        
        return result;
      } catch (e) {
        return null;
      }
    },
    [chess]
  );

  // onDrop function
  function onDrop(sourceSquare, targetSquare) {
    console.log("=== MOVE ATTEMPT ===");
    console.log("Current turn:", chess.turn());
    console.log("My orientation:", orientation);
    console.log("Players count:", players.length);
    console.log("From:", sourceSquare, "To:", targetSquare);

    // Check if it's your turn
    if (chess.turn() !== orientation[0]) {
      console.log("❌ Not your turn!");
      return false;
    }

    // Check if both players are present
    if (players.length < 2) {
      console.log("❌ Need 2 players, currently have:", players.length);
      return false;
    }

    const moveData = {
      from: sourceSquare,
      to: targetSquare,
      color: chess.turn(),
      promotion: "q",
    };

    console.log("Attempting move:", moveData);
    const move = makeAMove(moveData);

    if (move === null) {
      console.log("❌ Invalid move!");
      return false;
    }

    console.log("✅ Valid move, emitting to server:", move);
    socket.emit("move", {
      move,
      room,
    });

    return true;
  }

  useEffect(() => {
    const handleMove = (move) => {
      console.log("Received move:", move);
      makeAMove(move);
    };

    socket.on("move", handleMove);
    
    // Cleanup function to remove listener
    return () => {
      socket.off("move", handleMove);
    };
  }, [makeAMove]);
  
  // Game component returned jsx
  return (
    <Stack>
      <Card>
        <CardContent>
          <Typography variant="h5">Room ID: {room}</Typography>
        </CardContent>
      </Card>
      <Stack flexDirection="row" sx={{ pt: 2 }}>
        <div className="board" style={{
          maxWidth: 600,
          maxHeight: 600,
          flexGrow: 1,
        }}>
          <Chessboard
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={orientation}
          />
        </div>
        {players.length > 0 && (
          <Box>
            <List>
              <ListSubheader>Players</ListSubheader>
              {players.map((p) => (
                <ListItem key={p.id}>
                  <ListItemText primary={p.username} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Stack>
      <Box>
        <List>
          <ListSubheader>Game Log</ListSubheader>
          {gameLog.map((move, index) => (
            <ListItem key={index}>
              <ListItemText primary={move} />
            </ListItem>
          ))}
        </List>
      </Box>
      <CustomDialog // Game Over CustomDialog
        open={Boolean(over)}
        title={over}
        contentText={over}
        handleContinue={() => {
          setOver("");
        }}
      />
    </Stack>
  );
}

export default Game;
