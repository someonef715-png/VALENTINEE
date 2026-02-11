import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { AppStep } from './types.ts';
import { VANSH_INFO, ARGUMENT_COMMENTS } from './constants.ts';
import { Heart, ChevronRight, Sparkles, Trophy, Mail, X, Stars, Send, Volume2, VolumeX, Ghost, Palette, RotateCcw, Download, Share2 } from 'lucide-react';

// Custom Cursor Follower
const CursorFollower = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      style={{ x: mouseX, y: mouseY, translateX: '-50%', translateY: '-50%' }}
      className="fixed pointer-events-none z-[999] text-rose-400 hidden md:block"
    >
      <Heart size={20} fill="currentColor" className="opacity-50" />
    </motion.div>
  );
};

// Scratch Area Component
const ScratchArea: React.FC<{ secret: string }> = ({ secret }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width;
      canvas.height = rect.height;
    }

    ctx.fillStyle = '#fda4af'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'bold 18px Quicksand';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH TO REVEAL SECRET', canvas.width / 2, canvas.height / 2 + 7);

    const scratch = (e: MouseEvent | TouchEvent) => {
      if (!isDrawing.current) return;
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top;

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 25, 0, Math.PI * 2);
      ctx.fill();
    };

    const startDrawing = () => { isDrawing.current = true; };
    const stopDrawing = () => { isDrawing.current = false; };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('touchstart', startDrawing);
    window.addEventListener('mouseup', stopDrawing);
    window.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('touchmove', scratch);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      window.removeEventListener('mouseup', stopDrawing);
      window.removeEventListener('touchend', stopDrawing);
      canvas.addEventListener('mousemove', scratch);
      canvas.addEventListener('touchmove', scratch);
    };
  }, []);

  return (
    <div className="relative w-full h-32 bg-rose-50 rounded-[2rem] overflow-hidden border-4 border-dashed border-rose-200 flex items-center justify-center">
      <p className="text-2xl text-rose-600 font-black italic select-none px-4 text-center">
        "{secret}"
      </p>
      <canvas ref={canvasRef} className="absolute inset-0 cursor-crosshair touch-none" />
    </div>
  );
};

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.WELCOME);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 }); 
  const [commentIdx, setCommentIdx] = useState(-1);
  const [heartScale, setHeartScale] = useState(1);
  const [isZoomingOut, setIsZoomingOut] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [gameHearts, setGameHearts] = useState<{ id: number, x: number, type: 'heart' | 'halwa' }[]>([]);
  const [letterOpened, setLetterOpened] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [theme, setTheme] = useState<'rose' | 'lavender' | 'sky'>('rose');
  const [formData, setFormData] = useState({ food: '', color: '', place: '', habit: '' });
  const [knockCount, setKnockCount] = useState(0);
  const [eyePos, setEyePos] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);
  const [emojiPokeCount, setEmojiPokeCount] = useState(0);
  const [formFeedback, setFormFeedback] = useState<string>('');

  const popSound = useRef<HTMLAudioElement | null>(null);
  const successSound = useRef<HTMLAudioElement | null>(null);
  const gameInterval = useRef<number | null>(null);

  const stepsList = [
    AppStep.WELCOME,
    AppStep.MESSAGE,
    AppStep.PROPOSAL,
    AppStep.LOVE_METER,
    AppStep.HEART_GAME,
    AppStep.FAV_THINGS_FORM,
    AppStep.FINAL,
    AppStep.INTERACTIVE_LETTER
  ];

  const currentStepIndex = stepsList.indexOf(step === AppStep.EASY_PULL ? AppStep.LOVE_METER : step);

  useEffect(() => {
    popSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3');
    successSound.current = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    popSound.current.volume = 0.3;
    successSound.current.volume = 0.3;
  }, []);

  useEffect(() => {
    if (step === AppStep.HEART_GAME) {
      gameInterval.current = window.setInterval(() => {
        setGameHearts(prev => [
          ...prev,
          { 
            id: Math.random(), 
            x: Math.random() * 80 + 10,
            type: (Math.random() > 0.8 ? 'halwa' : 'heart') as 'heart' | 'halwa' 
          }
        ].slice(-15));
      }, 700);
    } else {
      if (gameInterval.current) clearInterval(gameInterval.current);
      setGameHearts([]);
    }
    return () => { if (gameInterval.current) clearInterval(gameInterval.current); };
  }, [step]);

  const fireConfetti = () => {
    if (typeof (window as any).confetti === 'function') {
      (window as any).confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: theme === 'rose' ? ['#f43f5e', '#fb7185', '#ffffff'] : theme === 'lavender' ? ['#8b5cf6', '#a78bfa', '#ffffff'] : ['#0ea5e9', '#38bdf8', '#ffffff']
      });
    }
  };

  const nextStep = () => {
    if (step === AppStep.EASY_PULL) {
      setStep(AppStep.LOVE_METER);
      return;
    }
    const currentIndex = stepsList.indexOf(step);
    if (currentIndex !== -1 && currentIndex < stepsList.length - 1) {
      setStep(stepsList[currentIndex + 1]);
      if (stepsList[currentIndex + 1] === AppStep.INTERACTIVE_LETTER) {
        setTimeout(fireConfetti, 1000);
      }
    }
  };

  const playSound = (sound: React.RefObject<HTMLAudioElement | null>) => {
    if (!isMuted && sound.current) {
      sound.current.currentTime = 0;
      sound.current.play().catch(() => {});
    }
  };

  const spawnParticle = (x: number, y: number) => {
    const id = Math.random();
    setParticles(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 1000);
  };

  const handleNoClick = (e: React.MouseEvent) => {
    spawnParticle(e.clientX, e.clientY);
    playSound(popSound);
    setShouldShake(true);
    setTimeout(() => setShouldShake(false), 500);

    let newX, newY;
    do {
      newX = (Math.random() - 0.5) * (window.innerWidth * 0.7);
      newY = (Math.random() - 0.5) * (window.innerHeight * 0.4);
    } while (Math.abs(newX) < 150 && Math.abs(newY) < 100);
    setNoButtonPos({ x: newX, y: newY });
    setCommentIdx((prev) => (prev + 1) % ARGUMENT_COMMENTS.length);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    if (isZoomingOut) return;
    spawnParticle(e.clientX, e.clientY);
    playSound(popSound);
    setHeartScale(prev => {
        const next = prev * 1.6;
        if (next > 18) {
            setIsZoomingOut(true);
            setTimeout(() => {
              setHeartScale(1);
              setIsZoomingOut(false);
              nextStep();
            }, 800);
            return next;
        }
        return next;
    });
  };

  const catchHeart = (id: number) => {
    const heart = gameHearts.find(h => h.id === id);
    if (heart) {
      playSound(popSound);
      setGameScore(prev => {
        const next = prev + (heart.type === 'halwa' ? 2 : 1);
        if (next >= 10 && prev < 10) fireConfetti();
        return next;
      });
      setGameHearts(prev => prev.filter(h => h.id !== id));
    }
  };

  const themeClasses = {
    rose: 'text-rose-600 bg-rose-500 border-rose-100 placeholder:text-rose-200',
    lavender: 'text-purple-600 bg-purple-500 border-purple-100 placeholder:text-purple-200',
    sky: 'text-sky-600 bg-sky-500 border-sky-100 placeholder:text-sky-200',
  };

  const handleFormChange = (key: string, val: string) => {
    setFormData({...formData, [key]: val});
    if (val.toLowerCase().includes('halwa') || val.toLowerCase().includes('moong')) {
      setFormFeedback('Thinking about our sweet moments? ✨');
    } else if (val.toLowerCase().includes('iamr')) {
      setFormFeedback('Good memory, IAMR boy! 🎓');
    } else if (val.length > 10) {
      setFormFeedback('Wow, so many words! ✍️');
    } else {
      setFormFeedback('');
    }
  };

  const restartApp = () => {
    setStep(AppStep.WELCOME);
    setGameScore(0);
    setKnockCount(0);
    setHeartScale(1);
    setFormData({ food: '', color: '', place: '', habit: '' });
    setLetterOpened(false);
  };

  return (
    <div onMouseMove={(e) => {
      if (step === AppStep.EASY_PULL) {
        const x = (e.clientX / window.innerWidth - 0.5) * 20;
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        setEyePos({ x, y });
      }
    }} className={`min-h-screen w-full flex items-center justify-center p-4 overflow-hidden relative transition-colors duration-1000 ${theme === 'rose' ? 'bg-rose-50' : theme === 'lavender' ? 'bg-purple-50' : 'bg-sky-50'} ${shouldShake ? 'shake' : ''}`}>
      <CursorFollower />
      
      {/* Progress Bar */}
      {step !== AppStep.WELCOME && step !== AppStep.INTERACTIVE_LETTER && (
        <div className="fixed top-0 left-0 w-full h-2 bg-black/5 z-[1000]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentStepIndex / (stepsList.length - 1)) * 100}%` }}
            className={`h-full transition-colors duration-500 ${themeClasses[theme].split(' ')[1]}`}
          />
        </div>
      )}

      {/* Floating Controls */}
      <div className="fixed top-6 right-6 z-[999] flex gap-3">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 90 }}
          onClick={() => setTheme(theme === 'rose' ? 'lavender' : theme === 'lavender' ? 'sky' : 'rose')}
          className="bg-white p-3 rounded-full shadow-lg text-rose-500 border border-rose-100"
        >
          <Palette size={20} className={themeClasses[theme].split(' ')[0]} />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          onClick={() => setIsMuted(!isMuted)}
          className="bg-white p-3 rounded-full shadow-lg text-rose-500 border border-rose-100"
        >
          {isMuted ? <VolumeX size={20} className={themeClasses[theme].split(' ')[0]} /> : <Volume2 size={20} className={themeClasses[theme].split(' ')[0]} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, scale: 0, x: p.x, y: p.y }}
            animate={{ opacity: 0, scale: 2, y: p.y - 100 }}
            className={`fixed pointer-events-none z-[50] ${themeClasses[theme].split(' ')[0]}`}
          >
            <Heart size={24} fill="currentColor" />
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === AppStep.WELCOME && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, filter: 'blur(10px)' }}
            className="text-center group select-none"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative flex flex-col items-center"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setKnockCount(p => p + 1);
                  playSound(popSound);
                  if (knockCount >= 4) {
                    playSound(successSound);
                    nextStep();
                  }
                }}
                className={`text-[10rem] md:text-[12rem] bg-white p-8 md:p-10 rounded-[3rem] shadow-2xl border-8 border-white cursor-pointer relative transition-all`}
              >
                💌
                <AnimatePresence>
                  {knockCount > 0 && knockCount < 5 && (
                     <motion.div
                      key={knockCount}
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      className={`absolute -top-10 left-1/2 -translate-x-1/2 text-white text-xl px-4 py-2 rounded-full font-bold whitespace-nowrap shadow-lg ${themeClasses[theme].split(' ')[1]}`}
                     >
                       {5 - knockCount} knocks to enter!
                     </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
            <p className={`mt-8 font-bold text-2xl tracking-wide animate-pulse ${themeClasses[theme].split(' ')[0]}`}>
              Vansh, click the envelope 5 times... ✊
            </p>
          </motion.div>
        )}

        {step === AppStep.MESSAGE && (
          <motion.div
            key="message"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 max-w-sm w-full"
          >
            <motion.div 
              drag
              dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
              className="text-[10rem] bg-white rounded-3xl shadow-2xl border-8 border-white p-6 mx-auto w-fit cursor-grab"
            >
              💖
            </motion.div>
            <div className="space-y-4">
                <h1 className={`text-5xl font-handwritten font-bold leading-tight ${themeClasses[theme].split(' ')[0]}`}>
                Be my Valentine, Vansh Tyagi? 🌹
                </h1>
                <p className="opacity-60 font-medium">Khushi is waiting for your move...</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={nextStep}
              className={`text-white px-10 py-4 rounded-full shadow-lg flex items-center gap-3 mx-auto font-bold text-xl ${themeClasses[theme].split(' ')[1]}`}
            >
              See the Options <ChevronRight />
            </motion.button>
          </motion.div>
        )}

        {step === AppStep.PROPOSAL && (
          <motion.div
            key="proposal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center w-full max-w-xl px-4"
          >
            <h2 className={`text-3xl font-bold mb-8 text-center ${themeClasses[theme].split(' ')[0]}`}>Final answer time! ⌛</h2>
            <div className="h-32 w-full flex items-center justify-center">
              <AnimatePresence mode="wait">
                {commentIdx >= 0 && (
                  <motion.div 
                      key={commentIdx}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50 }}
                      className="bg-white p-6 rounded-3xl shadow-xl border-2 border-white text-center w-full"
                  >
                      <p className={`text-xl font-medium italic ${themeClasses[theme].split(' ')[0]}`}>"{ARGUMENT_COMMENTS[commentIdx]}"</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative w-full h-80 flex items-center justify-center mt-8">
              <motion.button
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
                onClick={() => {
                  playSound(successSound);
                  fireConfetti();
                  setStep(AppStep.EASY_PULL);
                }}
                className="z-30 bg-[#4ade80] text-white text-4xl font-black px-12 py-6 rounded-[2rem] shadow-2xl absolute"
              >
                YES! ✅
              </motion.button>
              <motion.button
                animate={{ 
                  x: commentIdx === -1 ? 160 : noButtonPos.x, 
                  y: commentIdx === -1 ? 0 : noButtonPos.y 
                }}
                onClick={handleNoClick}
                className={`z-40 text-white text-xl font-bold px-8 py-4 rounded-2xl shadow-xl absolute transition-colors ${themeClasses[theme].split(' ')[1]}`}
              >
                No ❌
              </motion.button>
            </div>
          </motion.div>
        )}

        {step === AppStep.EASY_PULL && (
          <motion.div
            key="easy-pull"
            initial={{ opacity: 0, rotateX: 90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            className="text-center space-y-8"
          >
            <div 
                onClick={() => { setEmojiPokeCount(p => p + 1); playSound(popSound); }}
                className="relative inline-block cursor-pointer group"
            >
                <span className="text-[10rem]">😒</span>
                <motion.div animate={{ x: eyePos.x, y: eyePos.y }} className="absolute top-[40%] left-[25%] w-4 h-4 bg-black rounded-full" />
                <motion.div animate={{ x: eyePos.x, y: eyePos.y }} className="absolute top-[40%] right-[25%] w-4 h-4 bg-black rounded-full" />
                <AnimatePresence>
                  {emojiPokeCount > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -40 }} exit={{ opacity: 0 }} className={`absolute left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-sm font-bold shadow-md whitespace-nowrap ${themeClasses[theme].split(' ')[0]}`}>
                      {emojiPokeCount < 3 ? "Hey!" : "Vansh, stop it! 😂"}
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
            <div className="space-y-2">
                <h2 className={`text-5xl font-black uppercase tracking-tighter ${themeClasses[theme].split(' ')[0]}`}>EASY PULL!</h2>
                <p className="opacity-60 text-xl font-medium italic">I knew you couldn't say no to Khushi...</p>
            </div>
            <motion.button 
                whileHover={{ scale: 1.05 }}
                onClick={nextStep} 
                className={`text-white px-10 py-4 rounded-full font-bold shadow-lg flex items-center gap-2 mx-auto ${themeClasses[theme].split(' ')[1]}`}
            >
                Next Level <ChevronRight size={24} />
            </motion.button>
          </motion.div>
        )}

        {step === AppStep.LOVE_METER && (
          <motion.div key="love-meter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center w-full max-w-2xl relative">
            <h2 className={`text-5xl font-bold mb-4 ${themeClasses[theme].split(' ')[0]}`}>How much love?</h2>
            <p className="opacity-40 text-xl mb-16">Tap the heart repeatedly!</p>
            <div className="flex justify-center items-center h-48 relative">
              <motion.button 
                onClick={handleHeartClick} 
                animate={{ scale: isZoomingOut ? 0 : heartScale, opacity: isZoomingOut ? 0 : 1 }} 
                className={`drop-shadow-2xl z-20 ${themeClasses[theme].split(' ')[0]}`}
              >
                <Heart size={100} fill="currentColor" />
              </motion.button>
            </div>
            <div className="mt-20 px-8">
              <div className="w-full bg-black/5 h-3 rounded-full overflow-hidden">
                <motion.div className={`h-full ${themeClasses[theme].split(' ')[1]}`} animate={{ width: `${(Math.log(heartScale)/Math.log(18)) * 100}%` }} />
              </div>
            </div>
          </motion.div>
        )}

        {step === AppStep.HEART_GAME && (
          <motion.div key="heart-game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center w-full h-full relative flex flex-col items-center">
            <div className="bg-white/95 backdrop-blur px-8 py-5 rounded-[2rem] shadow-xl border-2 border-white z-50 mb-8 max-w-sm w-full">
              <p className={`font-bold text-xl flex items-center justify-center gap-2 ${themeClasses[theme].split(' ')[0]}`}>Catch 10 items for Khushi! <Heart size={20} className="fill-current" /></p>
              <div className="w-full bg-black/5 h-4 rounded-full mt-4 overflow-hidden">
                <motion.div className={`h-full ${themeClasses[theme].split(' ')[1]}`} animate={{ width: `${(Math.min(gameScore, 10) / 10) * 100}%` }} />
              </div>
              <p className="opacity-40 font-bold mt-2">{gameScore} / 10 collected</p>
            </div>
            <AnimatePresence>
              {gameScore >= 10 && (
                <motion.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }} 
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-12 rounded-[3.5rem] shadow-2xl z-[100] border-8 border-rose-100 text-center w-[90%] max-w-md"
                >
                  <Trophy size={100} className="text-yellow-400 mx-auto mb-4" />
                  <h2 className={`text-4xl font-black uppercase ${themeClasses[theme].split(' ')[0]}`}>Legend Status!</h2>
                  <p className="opacity-60 font-bold mt-2 mb-8">Vansh has earned Khushi's respect! ❤️</p>
                  <motion.button 
                      whileHover={{ scale: 1.05 }}
                      onClick={nextStep}
                      className={`text-white px-8 py-4 rounded-full font-bold shadow-lg ${themeClasses[theme].split(' ')[1]}`}
                  >
                      The Final Step
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative w-full h-[60vh] overflow-hidden">
              <AnimatePresence>
                {gameHearts.map((h) => (
                  <motion.div key={h.id} initial={{ y: -100, x: `${h.x}%`, opacity: 0 }} animate={{ y: window.innerHeight + 100, opacity: 1 }} exit={{ opacity: 0, scale: 2 }} transition={{ duration: 3.5, ease: 'linear' }} onPointerDown={() => catchHeart(h.id)} className="absolute text-6xl cursor-pointer select-none touch-none hover:scale-125 transition-transform p-4" style={{ left: 0 }}>
                    {h.type === 'heart' ? '❤️' : '🥣'}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {step === AppStep.FAV_THINGS_FORM && (
          <motion.div key="fav-form" initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} className="max-w-md w-full bg-white p-8 rounded-[3rem] shadow-2xl space-y-6 relative border-b-8 border-rose-100">
            <h2 className={`text-3xl font-bold text-center ${themeClasses[theme].split(' ')[0]}`}>The Khushi Quiz 🧠</h2>
            <div className="space-y-4">
              {['food', 'color', 'place', 'habit'].map((key) => (
                <div key={key} className="space-y-1">
                    <label className={`text-sm font-bold capitalize opacity-60 ${themeClasses[theme].split(' ')[0]}`}>Vansh, what is my favorite {key}?</label>
                    <div className="relative">
                      <motion.input 
                          whileFocus={{ scale: 1.01 }}
                          type="text" 
                          value={(formData as any)[key]} 
                          onChange={e => handleFormChange(key, e.target.value)} 
                          className={`w-full p-4 rounded-2xl bg-black/5 border-2 outline-none transition-all font-bold text-slate-800 border-transparent focus:border-current ${themeClasses[theme].split(' ')[0]}`}
                          placeholder={`Typing...`} 
                      />
                    </div>
                </div>
              ))}
            </div>
            <AnimatePresence>
              {formFeedback && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0 }} className={`text-center font-bold text-sm ${themeClasses[theme].split(' ')[0]}`}>
                  {formFeedback}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.button 
                whileHover={{ scale: 1.02 }}
                onClick={nextStep} 
                className={`w-full text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg ${themeClasses[theme].split(' ')[1]}`}
            >
              Verify My Answers <Send size={20} />
            </motion.button>
          </motion.div>
        )}

        {step === AppStep.FINAL && (
          <motion.div key="final" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-10 max-w-md px-4 pb-24">
            <motion.div 
                whileHover={{ scale: 1.1, rotate: -5 }}
                drag
                className="bg-white p-12 rounded-full shadow-2xl inline-block border-8 border-white cursor-grab"
            >
                <span className="text-8xl">🤔</span>
            </motion.div>
            <div className="space-y-4">
                <h2 className={`text-4xl font-bold leading-tight ${themeClasses[theme].split(' ')[0]}`}>I think u can be my valentine...</h2>
                <motion.div 
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`text-white p-8 rounded-[2.5rem] shadow-xl ${themeClasses[theme].split(' ')[1]}`}
                >
                    <p className="text-3xl font-black italic tracking-wider">...BUT I TELL U LATER! 😜</p>
                </motion.div>
            </div>
            
            <div className="flex justify-center gap-6 opacity-40">
               <Ghost className="animate-bounce" />
               <Sparkles className="animate-pulse" />
               <Ghost className="animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>

            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              onClick={nextStep}
              className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white p-8 rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] cursor-pointer flex flex-col items-center gap-2 border-t-4 border-rose-50 z-50 transition-all w-full max-w-sm"
            >
              <Mail size={56} className={themeClasses[theme].split(' ')[0]} />
              <p className={`font-black text-lg uppercase tracking-widest animate-pulse mt-2 ${themeClasses[theme].split(' ')[0]}`}>Click to Open Official Letter</p>
            </motion.div>
          </motion.div>
        )}

        {step === AppStep.INTERACTIVE_LETTER && (
          <motion.div
            key="interactive-letter"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            className="fixed inset-0 z-[200] bg-white flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className={`max-w-2xl w-full rounded-[4rem] shadow-2xl p-8 relative border-8 transition-all duration-700 min-h-[95vh] flex flex-col overflow-hidden bg-white ${theme === 'rose' ? 'border-rose-100' : theme === 'lavender' ? 'border-purple-100' : 'border-sky-100'}`}>
              <button onClick={restartApp} className="absolute top-8 right-8 p-3 bg-black/5 rounded-full z-[450] hover:bg-black/10 transition-colors">
                <RotateCcw size={24} className="opacity-40" />
              </button>

              <AnimatePresence mode="wait">
                {!letterOpened ? (
                  <motion.div 
                    key="closed-letter"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="text-center space-y-12 flex flex-col items-center justify-center flex-grow"
                  >
                    <motion.div 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="text-[12rem] cursor-pointer drop-shadow-2xl"
                        onClick={() => setLetterOpened(true)}
                    >
                        ✉️
                    </motion.div>
                    <h2 className={`text-4xl font-black ${themeClasses[theme].split(' ')[0]}`}>A Message for You, Vansh</h2>
                    <motion.button 
                        whileHover={{ scale: 1.1 }} 
                        onClick={() => { setLetterOpened(true); fireConfetti(); }} 
                        className={`text-white px-16 py-8 rounded-[2.5rem] font-black text-3xl shadow-xl flex items-center gap-4 ${themeClasses[theme].split(' ')[1]}`}
                    >
                        READ FROM HEART <Sparkles />
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div key="opened-letter" className="w-full flex flex-col items-center flex-grow py-8 overflow-hidden relative">
                    {/* Stickers Layer */}
                    <div className="absolute inset-0 pointer-events-none z-[300]">
                       {[
                           { emoji: '✨', label: 'Magic Connection', top: '5%', right: '5%', rotate: 12 },
                           { emoji: '🎓', label: 'IAMR Pride', top: '25%', left: '5%', rotate: -6 },
                           { emoji: '💫', label: 'Soulmate Energy', top: '45%', right: '10%', rotate: 8 }
                       ].map((sticker, idx) => (
                           <motion.div 
                                key={idx}
                                drag 
                                dragConstraints={{ left: -50, right: 300, top: -50, bottom: 500 }} 
                                animate={{ y: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 3, delay: idx * 0.5 }}
                                className="pointer-events-auto absolute cursor-grab bg-white p-4 rounded-2xl shadow-xl z-[310] border-2 border-black/5"
                                style={{ top: sticker.top, left: sticker.left, right: sticker.right, rotate: sticker.rotate }}
                           >
                              <span className="text-4xl">{sticker.emoji}</span>
                              <p className="text-[10px] font-black opacity-40 uppercase mt-1">{sticker.label}</p>
                           </motion.div>
                       ))}
                    </div>

                    {/* Scrollable Letter Body */}
                    <div className="w-full max-w-lg space-y-8 font-handwritten text-4xl leading-relaxed text-center px-6 overflow-y-auto max-h-[70vh] custom-scrollbar relative z-[350] text-slate-900 pb-20">
                      <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`text-7xl font-black mb-8 ${themeClasses[theme].split(' ')[0]}`}>My Vansh,</motion.h1>
                      
                      <p>If you're reading this, it means you've put up with all my silliness today. I hope these little games made you smile, because that's truly what I love most—seeing that light in your eyes.</p>
                      
                      <p>Our journey since we first met at <strong>{VANSH_INFO.collegeName}</strong> hasn't just been about dates or hanging out. It's been about finding a home in another person. You've become my anchor, my best friend, and the person I want to share every quiet moment and every loud victory with.</p>
                      
                      <p>I know I tease you a lot (and I probably won't stop), but behind every joke is a heart that is completely and utterly yours. I value every small thing we share—the laughs that leave us breathless, the long talks that feel too short, and the way you always know how to make me feel safe.</p>
                      
                      <p>So, Vansh Tyagi, the teasing stops for just this moment. The answer to everything we’ve ever been and everything we will be together is a heartfelt, emotional <strong>YES</strong>. I want to be your Valentine today, tomorrow, and every single day our future holds.</p>

                      <div className="py-12 px-4">
                        <ScratchArea secret="You're the love of my life, Vansh! ❤️" />
                        <p className="text-[14px] font-bold opacity-40 mt-6 tracking-widest uppercase font-sans">Scratch for a little promise</p>
                      </div>
                      
                      <div className="py-12 flex flex-col items-center">
                        <motion.div 
                          animate={{ 
                            scale: [1, 1.3, 1],
                            filter: ["drop-shadow(0 0 0px #f43f5e)", "drop-shadow(0 0 20px #f43f5e)", "drop-shadow(0 0 0px #f43f5e)"] 
                          }} 
                          transition={{ repeat: Infinity, duration: 2 }} 
                          className={`text-9xl drop-shadow-xl ${themeClasses[theme].split(' ')[0]}`}
                        >
                          ❤️
                        </motion.div>
                        <p className="text-6xl mt-10 font-black tracking-tighter text-slate-900">Forever Yours, Khushi</p>
                      </div>

                      {/* Spacer to allow scrolling past bottom buttons */}
                      <div className="h-40" /> 
                    </div>

                    {/* Footer Layer (Always On Top) */}
                    <div className="mt-auto w-full pt-8 border-t border-black/5 flex flex-col items-center gap-4 relative z-[400] bg-white/95 backdrop-blur-sm pb-6">
                      <div className="flex gap-4">
                        <motion.button whileHover={{ scale: 1.1 }} className="bg-white p-4 rounded-2xl shadow-lg border border-rose-50 text-rose-500"><Download size={24} /></motion.button>
                        <motion.button whileHover={{ scale: 1.1 }} className="bg-white p-4 rounded-2xl shadow-lg border border-rose-50 text-rose-500"><Share2 size={24} /></motion.button>
                      </div>
                      <div className="text-center">
                        <p className="opacity-40 font-bold uppercase tracking-widest text-[11px] mb-4 italic font-sans">Hold for a Secret Whisper</p>
                        <motion.button 
                            onMouseDown={() => { setShowSecret(true); playSound(successSound); }} 
                            onMouseUp={() => setShowSecret(false)} 
                            className={`text-white w-24 h-24 rounded-full flex items-center justify-center cursor-pointer shadow-xl select-none group border-4 border-white ${themeClasses[theme].split(' ')[1]}`}
                        >
                          <Stars size={40} className="group-hover:rotate-180 transition-transform duration-700" />
                          <AnimatePresence>
                            {showSecret && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 4, opacity: 0 }} className={`absolute rounded-full w-full h-full -z-10 ${themeClasses[theme].split(' ')[1]}`} />
                            )}
                          </AnimatePresence>
                        </motion.button>
                      </div>
                      <AnimatePresence>
                        {showSecret && (
                          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/98 backdrop-blur-xl p-12 rounded-[4rem] border-8 border-rose-500 text-rose-600 font-bold text-center z-[500] shadow-2xl w-[90%] max-w-md">
                            <Sparkles className="mx-auto mb-6 text-yellow-400" size={80} />
                            <p className="text-5xl font-handwritten leading-relaxed text-slate-900">"You are my whole world, Vansh. I love you endlessly."</p>
                            <div className="mt-10 text-xl uppercase tracking-widest opacity-40 font-black font-sans">- With all my heart, Khushi -</div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;