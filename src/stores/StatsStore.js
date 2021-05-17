import  {writable } from 'svelte/store'

//Player Stats
export const Level = writable(1);
export const Experience = writable(0);
export const ClickDmg = writable(1);
export const AutoDmg = writable(0);

//Boss Statsb
export const BossHP = writable(10);
export const BossDeath = writable(false);
export let BossLevel = writable(1);

//misc
export const Cost = writable(50);