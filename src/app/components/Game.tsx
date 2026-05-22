'use client'
import React, { useEffect, useRef, useState } from 'react';
import { initGame } from '../main';
import { usePlinkoStore } from '../store';

interface PhaserGame {
    destroy: (removeCanvas: boolean) => void;
}

const GAME_WIDTH = 1229;
const GAME_HEIGHT = 591;
const MOBILE_BREAKPOINT = 700;
const MOBILE_PANEL_HEIGHT_RATIO = 0.55;

const Game = () => {
    const gameRef = useRef<HTMLDivElement>(null);
    const gameInstance = useRef<PhaserGame | null>(null);
    const [scale, setScale] = useState(1);
    const [isMobile, setIsMobile] = useState(false);

    const changeBalance = usePlinkoStore(state => state.changeBalance);

    useEffect(() => {
        if (typeof window !== 'undefined' && gameRef.current && !gameInstance.current) {
            gameInstance.current = initGame(gameRef.current);
        }
        const handleBalanceUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const change = Number(customEvent.detail.changeAmount);
            changeBalance(change);
        };

        window.addEventListener('updateBalance', handleBalanceUpdate as EventListener);

        return () => {
            window.removeEventListener('updateBalance', handleBalanceUpdate as EventListener);
            if (gameInstance.current) {
                gameInstance.current.destroy(true);
                gameInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const updateScale = () => {
            const mobile = window.innerWidth < MOBILE_BREAKPOINT;
            setIsMobile(mobile);
            if (mobile) {
                const availW = window.innerWidth;
                const availH = window.innerHeight * MOBILE_PANEL_HEIGHT_RATIO;
                setScale(Math.min(availW / GAME_WIDTH, availH / GAME_HEIGHT));
            } else {
                setScale(1);
            }
        };

        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    // Always render the same DOM structure so gameRef is never orphaned when
    // isMobile toggles. Only the wrapper styles and game transform change.
    return (
        <div style={isMobile ? {
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
        } : {}}>
            <div
                ref={gameRef}
                style={{
                    width: `${GAME_WIDTH}px`,
                    height: `${GAME_HEIGHT}px`,
                    ...(isMobile ? {
                        transform: `scale(${scale})`,
                        transformOrigin: 'center center',
                        flexShrink: 0,
                    } : {}),
                }}
            />
        </div>
    );
};

export default Game;
