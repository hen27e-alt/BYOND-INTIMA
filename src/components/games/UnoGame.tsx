import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, EyeOff, Eye, Play } from 'lucide-react';

type Color = 'gold' | 'ruby' | 'sapphire' | 'emerald' | 'wild';
type Value = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'wild4';

interface Card {
  id: string;
  color: Color;
  value: Value;
}

const COLORS: Color[] = ['gold', 'ruby', 'sapphire', 'emerald'];
const VALUES: Value[] = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'skip', 'reverse', 'draw2'];

const COLOR_HEX = {
  gold: '#C9A96E',
  ruby: '#9B2C2C',
  sapphire: '#2C5282',
  emerald: '#276749',
  wild: '#1A202C' // brand-black
};

const generateDeck = (): Card[] => {
  let deck: Card[] = [];
  let idCounter = 0;

  COLORS.forEach(color => {
    deck.push({ id: `card_${idCounter++}`, color, value: '0' });
    for (let i = 1; i <= 9; i++) {
      deck.push({ id: `card_${idCounter++}`, color, value: i.toString() as Value });
      deck.push({ id: `card_${idCounter++}`, color, value: i.toString() as Value });
    }
    ['skip', 'reverse', 'draw2'].forEach(val => {
      deck.push({ id: `card_${idCounter++}`, color, value: val as Value });
      deck.push({ id: `card_${idCounter++}`, color, value: val as Value });
    });
  });

  for (let i = 0; i < 4; i++) {
    deck.push({ id: `card_${idCounter++}`, color: 'wild', value: 'wild' });
    deck.push({ id: `card_${idCounter++}`, color: 'wild', value: 'wild4' });
  }

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export const UnoGame = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [hands, setHands] = useState<{ 1: Card[], 2: Card[] }>({ 1: [], 2: [] });
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [currentColor, setCurrentColor] = useState<Color>('gold');
  const [turnState, setTurnState] = useState<'playing' | 'passing' | 'choosing_color' | 'game_over'>('passing');
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [message, setMessage] = useState<string>('המשחק מתחיל!');

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const newDeck = generateDeck();
    const hand1 = newDeck.splice(0, 7);
    const hand2 = newDeck.splice(0, 7);
    
    let firstCard = newDeck.pop()!;
    while (firstCard.color === 'wild') {
      newDeck.unshift(firstCard);
      firstCard = newDeck.pop()!;
    }

    setHands({ 1: hand1, 2: hand2 });
    setDiscardPile([firstCard]);
    setCurrentColor(firstCard.color);
    setDeck(newDeck);
    setCurrentPlayer(1);
    setTurnState('passing');
    setWinner(null);
    setMessage('תור שחקן 1 מתחיל');
  };

  const drawCards = (player: 1 | 2, count: number, currentDeck: Card[]) => {
    const drawn = currentDeck.splice(0, count);
    setHands(prev => ({
      ...prev,
      [player]: [...prev[player], ...drawn]
    }));
    return currentDeck;
  };

  const canPlayCard = (card: Card) => {
    const topCard = discardPile[discardPile.length - 1];
    if (card.color === 'wild') return true;
    if (card.color === currentColor) return true;
    if (card.value === topCard.value) return true;
    return false;
  };

  const handlePlayCard = (card: Card) => {
    if (!canPlayCard(card)) {
      setMessage('אי אפשר לשחק את הקלף הזה!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const newHand = hands[currentPlayer].filter(c => c.id !== card.id);
    setHands(prev => ({ ...prev, [currentPlayer]: newHand }));
    setDiscardPile(prev => [...prev, card]);

    if (newHand.length === 0) {
      setWinner(currentPlayer);
      setTurnState('game_over');
      return;
    }

    if (newHand.length === 1) {
      setMessage('BYOND! (קלף אחרון)');
    }

    let nextPlayer = currentPlayer === 1 ? 2 : 1;
    let newDeck = [...deck];

    if (card.color === 'wild') {
      setTurnState('choosing_color');
      if (card.value === 'wild4') {
        newDeck = drawCards(nextPlayer as 1 | 2, 4, newDeck);
        // Skip next player's turn
        nextPlayer = currentPlayer;
      }
      setDeck(newDeck);
      return;
    }

    setCurrentColor(card.color);

    if (card.value === 'skip' || card.value === 'reverse') {
      // In 2 player, skip and reverse both mean the current player goes again
      nextPlayer = currentPlayer;
      setMessage('תור נוסף!');
    } else if (card.value === 'draw2') {
      newDeck = drawCards(nextPlayer as 1 | 2, 2, newDeck);
      nextPlayer = currentPlayer; // Skip their turn
      setMessage('השחקן השני לוקח 2 קלפים ומפסיד תור!');
    }

    setDeck(newDeck);
    
    if (nextPlayer !== currentPlayer) {
      setCurrentPlayer(nextPlayer as 1 | 2);
      setTurnState('passing');
    }
  };

  const handleDrawCard = () => {
    if (deck.length === 0) {
      // Reshuffle discard pile (except top card)
      const topCard = discardPile.pop()!;
      const newDeck = [...discardPile].sort(() => Math.random() - 0.5);
      setDeck(newDeck);
      setDiscardPile([topCard]);
      return;
    }

    let newDeck = [...deck];
    newDeck = drawCards(currentPlayer, 1, newDeck);
    setDeck(newDeck);
    
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    setTurnState('passing');
  };

  const handleColorChoice = (color: Color) => {
    setCurrentColor(color);
    const topCard = discardPile[discardPile.length - 1];
    
    let nextPlayer = currentPlayer === 1 ? 2 : 1;
    if (topCard.value === 'wild4') {
      nextPlayer = currentPlayer; // Already skipped in handlePlayCard
    }
    
    setCurrentPlayer(nextPlayer as 1 | 2);
    setTurnState('passing');
  };

  const renderCard = (card: Card, isPlayable: boolean = false, onClick?: () => void) => {
    const isWild = card.color === 'wild';
    const displayValue = card.value === 'draw2' ? '+2' : 
                         card.value === 'wild4' ? '+4' : 
                         card.value === 'skip' ? 'Ø' : 
                         card.value === 'reverse' ? '⇄' : 
                         card.value === 'wild' ? 'W' : card.value;

    return (
      <motion.div
        whileHover={isPlayable ? { y: -10, scale: 1.05 } : {}}
        onClick={isPlayable ? onClick : undefined}
        className={`relative w-24 h-36 rounded-xl border-2 shadow-lg flex flex-col items-center justify-center cursor-${isPlayable ? 'pointer' : 'default'} overflow-hidden`}
        style={{ 
          backgroundColor: COLOR_HEX[card.color],
          borderColor: isWild ? '#C9A96E' : 'rgba(255,255,255,0.2)'
        }}
      >
        {/* Card inner border */}
        <div className="absolute inset-2 border-2 border-white/30 rounded-lg pointer-events-none"></div>
        
        {/* Top left value */}
        <div className="absolute top-3 left-3 text-white font-bold text-sm drop-shadow-md">
          {displayValue}
        </div>
        
        {/* Center value */}
        <div className="text-white font-serif font-bold text-4xl drop-shadow-lg">
          {displayValue}
        </div>
        
        {/* Bottom right value */}
        <div className="absolute bottom-3 right-3 text-white font-bold text-sm rotate-180 drop-shadow-md">
          {displayValue}
        </div>
        
        {!isPlayable && <div className="absolute inset-0 bg-black/10"></div>}
      </motion.div>
    );
  };

  if (turnState === 'game_over') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-brand-black rounded-3xl shadow-xl border border-brand-gold/20">
        <h2 className="text-5xl font-serif mb-6 text-brand-gold">שחקן {winner} ניצח!</h2>
        <p className="text-xl mb-12 text-white/70">
          כל הכבוד! מי שניצח מקבל מסאז' של 10 דקות הלילה.
        </p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startNewGame}
          className="flex items-center gap-2 px-8 py-4 bg-brand-gold text-brand-black rounded-full hover:bg-white transition-colors uppercase tracking-widest text-sm font-bold shadow-lg hover:shadow-brand-gold/30"
        >
          <RefreshCw size={18} />
          משחק חדש
        </motion.button>
      </div>
    );
  }

  if (turnState === 'passing') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-brand-black rounded-3xl shadow-xl border border-brand-gold/20">
        <EyeOff size={48} className="text-brand-gold mb-6 animate-pulse" />
        <h2 className="text-4xl font-serif mb-4 text-white">תור שחקן {currentPlayer}</h2>
        <p className="text-white/50 mb-12">העבירו את המכשיר לשחקן {currentPlayer} ולחצו על הכפתור כשאתם מוכנים.</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTurnState('playing')}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-gold to-[#e5c687] text-brand-black rounded-full hover:shadow-[0_0_30px_rgba(197,160,89,0.4)] transition-all uppercase tracking-widest text-sm font-bold"
        >
          <Eye size={18} />
          אני מוכן/ה
        </motion.button>
      </div>
    );
  }

  if (turnState === 'choosing_color') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-brand-black rounded-3xl shadow-xl border border-brand-gold/20">
        <h2 className="text-3xl font-serif mb-8 text-white">בחרו צבע חדש</h2>
        <div className="grid grid-cols-2 gap-4">
          {COLORS.map(color => (
            <motion.button
              key={color}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleColorChoice(color)}
              className="w-32 h-32 rounded-2xl shadow-lg border-2 border-white/20 transition-transform"
              style={{ backgroundColor: COLOR_HEX[color] }}
            />
          ))}
        </div>
      </div>
    );
  }

  const topCard = discardPile[discardPile.length - 1];

  return (
    <div className="flex flex-col h-full p-6 bg-brand-black rounded-3xl shadow-xl border border-brand-gold/20 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-brand-gold font-bold tracking-widest uppercase text-sm">
          שחקן {currentPlayer}
        </div>
        <div className="text-white/50 text-sm">
          קלפים בקופה: {deck.length}
        </div>
      </div>

      {/* Message Area */}
      <div className="h-8 text-center mb-4">
        <AnimatePresence mode="wait">
          {message && (
            <motion.p 
              key={message}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-brand-gold font-bold tracking-wider"
            >
              {message}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Play Area */}
      <div className="flex-grow flex flex-col items-center justify-center mb-8">
        <div className="flex gap-8 items-center">
          {/* Deck */}
          <div className="flex flex-col items-center gap-4">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              onClick={handleDrawCard}
              className="w-24 h-36 rounded-xl border-2 border-brand-gold bg-brand-black shadow-lg shadow-brand-gold/20 flex items-center justify-center cursor-pointer relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#C9A96E_10px,#C9A96E_20px)]"></div>
              <div className="bg-brand-black px-4 py-2 rounded-full border border-brand-gold z-10">
                <span className="text-brand-gold font-serif font-bold">BYOND</span>
              </div>
            </motion.div>
            <span className="text-white/50 text-xs uppercase tracking-widest">קופה (קח קלף)</span>
          </div>

          {/* Discard Pile */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              {topCard && renderCard(topCard)}
              {/* Current Color Indicator (if wild was played) */}
              {topCard?.color === 'wild' && (
                <div 
                  className="absolute -bottom-3 -right-3 w-8 h-8 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: COLOR_HEX[currentColor] }}
                />
              )}
            </div>
            <span className="text-white/50 text-xs uppercase tracking-widest">ערימה</span>
          </div>
        </div>
      </div>

      {/* Player Hand */}
      <div className="mt-auto">
        <div className="text-center mb-4 text-white/70 text-sm">
          הקלפים שלך ({hands[currentPlayer].length}):
        </div>
        <div className="flex flex-wrap justify-center gap-[-2rem] md:gap-2 overflow-x-auto pb-4 px-4 no-scrollbar">
          {hands[currentPlayer].map((card, index) => (
            <div 
              key={card.id} 
              className="transition-transform hover:z-10"
              style={{ 
                marginLeft: index === 0 ? 0 : '-2rem',
                zIndex: index 
              }}
            >
              {renderCard(card, canPlayCard(card), () => handlePlayCard(card))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
