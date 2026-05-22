'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { useEffect, useState, useRef } from 'react'
import { usePlinkoStore } from '../store'
import { dropPlinko } from '../main'

const Sidebar = () => {
    const [amount, setAmount] = useState(10);
    const [invalid, setInvalid] = useState(false);
    const [zeroBetWarning, setZeroBetWarning] = useState(false);
    const [isAutoBetting, setIsAutoBetting] = useState(false);
    const [autoAmount, setAutoAmount] = useState(10);
    const autoBettingRef = useRef<NodeJS.Timeout | null>(null);
    const balance = usePlinkoStore((state) => state.balance);
    const updateBalance = usePlinkoStore(state => state.changeBalance);

    useEffect(() => {
        setInvalid(balance < amount);
    }, [balance, amount])

    useEffect(() => {
        if (isAutoBetting && balance >= autoAmount && autoAmount > 0) {
            autoBettingRef.current = setInterval(() => {
                if (balance >= autoAmount) {
                    updateBalance(-autoAmount);
                    dropPlinko(autoAmount);
                }
            }, 250);
        } else {
            if (autoBettingRef.current) {
                clearInterval(autoBettingRef.current);
            }
        }

        return () => {
            if (autoBettingRef.current) {
                clearInterval(autoBettingRef.current);
            }
        };
    }, [isAutoBetting, autoAmount, balance, updateBalance])

    return (
        <div className='w-full h-full p-3 flex flex-col items-center' style={{ fontFamily: 'plinko_m', backgroundColor: 'rgb(33,55,67)', color: 'white' }}>
            <Tabs defaultValue="manual" className='w-full p-2'>
                <TabsList className='w-full flex justify-center rounded-full text-white h-12' style={{ backgroundColor: '#0F212E', minWidth: '130px' }}>
                    <TabsTrigger value="manual" className='flex-1 flex justify-center rounded-full data-[state=active]:bg-[rgb(47,69,83)] data-[state=active]:text-white text-sm font-bold text-center h-10' style={{ fontFamily: 'plinko_m' }}>Manual</TabsTrigger>
                    <TabsTrigger value="auto" className='flex-1 flex justify-center rounded-full text-white data-[state=active]:bg-[rgb(47,69,83)] data-[state=active]:text-white text-sm font-bold text-center h-10' style={{ fontFamily: 'plinko_m' }}>Auto</TabsTrigger>
                </TabsList>
                <TabsContent value="manual">
                    <div className='w-full'>
                        <Label htmlFor="amount" style={{ color: 'rgb(177, 186, 211)', fontFamily: 'plinko_m', fontWeight: 'bold' }}>Amount</Label>
                        <div className='relative mr-20'>
                            {invalid && (
                                <div className="absolute -top-6 left-5 transform -translate-y-full w-60 p-2 bg-white text-black text-sm rounded shadow-lg">
                                    <div className="relative">
                                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
                                        Can&apos;t play more than your balance!
                                    </div>
                                </div>
                            )}
                            {zeroBetWarning && (
                                <div className="absolute -top-6 left-5 transform -translate-y-full w-60 p-2 bg-white text-black text-sm rounded shadow-lg">
                                    <div className="relative">
                                        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-white"></div>
                                        Can&apos;t bet with amount 0!
                                    </div>
                                </div>
                            )}
                            <Input
                                id="betAmount"
                                type='number'
                                step={0.01}
                                placeholder={'10.00'}
                                value={amount}
                                onChange={(e) => {
                                    setAmount(parseFloat(e.target.value) || 0);
                                }}
                                onBlur={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const finalAmount = isNaN(value) || value < 0 ? 10 : parseFloat(value.toFixed(2));
                                    setAmount(finalAmount);
                                }}
                                className={`pr-8 rounded-none ${invalid ? 'border-red-500 hover:border-red-500' : ''}`}
                            />
                            <svg fill="none" viewBox="0 0 96 96" className="svg-icon absolute right-3 top-3" style={{ width: '16px', height: '16px' }}>
                                <title></title>
                                <path d="M48 96c26.51 0 48-21.49 48-48S74.51 0 48 0 0 21.49 0 48s21.49 48 48 48Z" fill="#FFC800"></path>
                                <path d="M48.16 21.92c10.16 0 16.56 4.92 20.32 10.72l-8.68 4.72c-2.28-3.44-6.48-6.16-11.64-6.16-8.88 0-15.36 6.84-15.36 16.12 0 9.28 6.48 16.12 15.36 16.12 4.48 0 8.44-1.84 10.6-3.76v-5.96H45.68v-8.96h23.4v18.76c-5 5.6-12 9.28-20.88 9.28-14.32 0-26.12-10-26.12-25.44C22.08 31.92 33.84 22 48.2 22l-.04-.08Z" fill="#473800"></path>
                            </svg>
                            <button
                                className="h-10 w-10 absolute top-0 -right-10 rounded-none transition duration-300 transform bg-[rgb(47,69,83)] hover:bg-[rgb(80,110,130)] flex items-center justify-center"
                                onClick={() => setAmount((prevAmount) => {
                                    const newAmount = parseFloat((prevAmount / 2).toFixed(2));
                                    return newAmount < 0 ? 0 : newAmount;
                                })}
                            >
                                ½
                            </button>
                            <button
                                className="h-10 w-10 absolute top-0 -right-20 rounded-tr rounded-br transition duration-300 transform bg-[rgb(47,69,83)] hover:bg-[rgb(80,110,130)] text-sm flex items-center justify-center"
                                onClick={() => setAmount((prevAmount) => {
                                    const newAmount = parseFloat((prevAmount * 2).toFixed(2));
                                    return newAmount < 0 ? 0 : newAmount;
                                })}
                            >
                                2×
                            </button>
                            <div className="h-6 w-0.5 bg-[rgb(26,44,56)] absolute top-1/2 transform -translate-y-1/2 -right-10 rounded"></div>
                        </div>
                    </div>
                    <button
                        id="bet-btn"
                        className="w-full h-14 text-black font-bold py-2 rounded transition duration-300 ease-in-out transform hover:bg-green-500 mt-4 text-lg"
                        style={{ backgroundColor: '#00ff00' }}
                        disabled={invalid}
                        onClick={() => {
                            if (amount === 0) {
                                setZeroBetWarning(true);
                                setTimeout(() => setZeroBetWarning(false), 3000);
                            } else {
                                updateBalance(-amount);
                            }
                        }}
                    >
                        Bet
                    </button>
                </TabsContent>
                <TabsContent value="auto">
                    <div className='w-full'>
                        <Label htmlFor="autoAmount" style={{ color: 'rgb(177, 186, 211)', fontFamily: 'plinko_m', fontWeight: 'bold' }}>Amount Per Bet</Label>
                        <div className='relative mr-20'>
                            <Input
                                id="autoAmount"
                                type='number'
                                step={0.01}
                                placeholder={'10.00'}
                                value={autoAmount}
                                onChange={(e) => {
                                    setAutoAmount(parseFloat(e.target.value) || 0);
                                }}
                                onBlur={(e) => {
                                    const value = parseFloat(e.target.value);
                                    const finalAmount = isNaN(value) || value < 0 ? 10 : parseFloat(value.toFixed(2));
                                    setAutoAmount(finalAmount);
                                }}
                                className="pr-8 rounded-none"
                            />
                            <svg fill="none" viewBox="0 0 96 96" className="svg-icon absolute right-3 top-3" style={{ width: '16px', height: '16px' }}>
                                <title></title>
                                <path d="M48 96c26.51 0 48-21.49 48-48S74.51 0 48 0 0 21.49 0 48s21.49 48 48 48Z" fill="#FFC800"></path>
                                <path d="M48.16 21.92c10.16 0 16.56 4.92 20.32 10.72l-8.68 4.72c-2.28-3.44-6.48-6.16-11.64-6.16-8.88 0-15.36 6.84-15.36 16.12 0 9.28 6.48 16.12 15.36 16.12 4.48 0 8.44-1.84 10.6-3.76v-5.96H45.68v-8.96h23.4v18.76c-5 5.6-12 9.28-20.88 9.28-14.32 0-26.12-10-26.12-25.44C22.08 31.92 33.84 22 48.2 22l-.04-.08Z" fill="#473800"></path>
                            </svg>
                            <button
                                className="h-10 w-10 absolute top-0 -right-10 rounded-none transition duration-300 transform bg-[rgb(47,69,83)] hover:bg-[rgb(80,110,130)] flex items-center justify-center"
                                onClick={() => setAutoAmount((prevAmount) => {
                                    const newAmount = parseFloat((prevAmount / 2).toFixed(2));
                                    return newAmount < 0 ? 0 : newAmount;
                                })}
                            >
                                ½
                            </button>
                            <button
                                className="h-10 w-10 absolute top-0 -right-20 rounded-tr rounded-br transition duration-300 transform bg-[rgb(47,69,83)] hover:bg-[rgb(80,110,130)] text-sm flex items-center justify-center"
                                onClick={() => setAutoAmount((prevAmount) => {
                                    const newAmount = parseFloat((prevAmount * 2).toFixed(2));
                                    return newAmount < 0 ? 0 : newAmount;
                                })}
                            >
                                2×
                            </button>
                            <div className="h-6 w-0.5 bg-[rgb(26,44,56)] absolute top-1/2 transform -translate-y-1/2 -right-10 rounded"></div>
                        </div>
                        <button
                            className={`w-full h-14 font-bold py-2 rounded transition duration-300 ease-in-out transform mt-4 text-lg ${
                                isAutoBetting
                                    ? 'hover:bg-red-600 text-white'
                                    : 'text-black hover:bg-green-500'
                            }`}
                            style={{
                                backgroundColor: isAutoBetting ? '#ff0000' : '#00ff00'
                            }}
                            disabled={autoAmount === 0 || autoAmount < 0}
                            onClick={() => setIsAutoBetting(!isAutoBetting)}
                        >
                            {isAutoBetting ? 'Stop Betting' : 'Start Betting'}
                        </button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default Sidebar