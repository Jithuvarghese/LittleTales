/**
 * Every character in LittleTales is built from the same parts (head, ears,
 * muzzle, eyes, cheeks, mouth, body, arms, feet, tail) so the whole cast looks
 * like one family. A species is just a recipe of those parts and colours.
 */
export type Ears = 'fox' | 'bear' | 'cat' | 'rabbit' | 'dog' | 'mouse' | 'cow' | 'pig' | 'elephant' | 'monkey' | 'tufts' | 'bolts' | 'human' | 'none';
export type Muzzle = 'fox' | 'round' | 'snout' | 'beak' | 'trunk' | 'cow' | 'duck' | 'none';
export type Tail = 'fox' | 'puff' | 'curl' | 'long' | 'feathers' | 'none';
export type Head = 'round' | 'wide' | 'box' | 'egg';
export type Hair = 'short' | 'curly' | 'bob' | 'ponytail' | 'bun' | 'braids' | 'grey' | 'none';
export type Arms = 'paws' | 'wings' | 'robot' | 'hands' | 'fins' | 'none';

export type Species = {
  name: string;
  fur: string; // main colour
  shade: string; // darker tone (feet, ear tips, markings)
  belly: string; // tummy / muzzle colour
  head: Head;
  ears: Ears;
  muzzle: Muzzle;
  tail: Tail;
  arms: Arms;
  nose?: string;
  hair?: Hair;
  hairColor?: string;
  clothes?: string; // body colour for people
  glasses?: boolean;
  mane?: string;
  spots?: boolean;
  crest?: string;
  antenna?: boolean;
  eyeY?: number;
};

const O = '#4a2f27';
export const OUTLINE = O;

export const species: Record<string, Species> = {
  // Main cast
  pip: { name: 'Pip the fox', fur: '#f2913d', shade: '#d9732a', belly: '#fff6e8', head: 'round', ears: 'fox', muzzle: 'fox', tail: 'fox', arms: 'paws' },
  bumble: { name: 'Bumble the bear', fur: '#b07a4f', shade: '#8a5a37', belly: '#f0d3ad', head: 'round', ears: 'bear', muzzle: 'round', tail: 'puff', arms: 'paws' },
  luna: { name: 'Luna the owl', fur: '#8f7ad6', shade: '#6f5bb8', belly: '#e4dcfa', head: 'egg', ears: 'tufts', muzzle: 'beak', tail: 'feathers', arms: 'wings' },
  zig: { name: 'Zig the robot', fur: '#9fd6ef', shade: '#5fa9cc', belly: '#e8f6ff', head: 'box', ears: 'bolts', muzzle: 'none', tail: 'none', arms: 'robot', antenna: true },
  coco: { name: 'Coco the parrot', fur: '#49b25a', shade: '#2f8a40', belly: '#ffd84d', head: 'round', ears: 'none', muzzle: 'beak', tail: 'feathers', arms: 'wings', crest: '#e8553f' },

  // Supporting animals
  cat: { name: 'cat', fur: '#f5b25c', shade: '#d98c35', belly: '#fff3e0', head: 'wide', ears: 'cat', muzzle: 'round', tail: 'long', arms: 'paws', nose: '#ff8fa3' },
  dog: { name: 'dog', fur: '#d9a066', shade: '#8b5a3c', belly: '#fff3e0', head: 'round', ears: 'dog', muzzle: 'round', tail: 'long', arms: 'paws' },
  cow: { name: 'cow', fur: '#ffffff', shade: '#4d4d4d', belly: '#ffc9d0', head: 'wide', ears: 'cow', muzzle: 'cow', tail: 'long', arms: 'paws', spots: true },
  duck: { name: 'duck', fur: '#ffd84d', shade: '#f2b22e', belly: '#fff3b0', head: 'round', ears: 'none', muzzle: 'duck', tail: 'feathers', arms: 'wings' },
  rabbit: { name: 'rabbit', fur: '#f4f1ee', shade: '#cfc6be', belly: '#ffffff', head: 'round', ears: 'rabbit', muzzle: 'round', tail: 'puff', arms: 'paws', nose: '#ff8fa3' },
  elephant: { name: 'elephant', fur: '#aab8c8', shade: '#8494a8', belly: '#cbd5e0', head: 'wide', ears: 'elephant', muzzle: 'trunk', tail: 'long', arms: 'paws' },
  monkey: { name: 'monkey', fur: '#9a6a45', shade: '#6e4a2f', belly: '#f2d2ac', head: 'round', ears: 'monkey', muzzle: 'round', tail: 'curl', arms: 'paws' },
  frog: { name: 'frog', fur: '#7dcc5a', shade: '#4fa33a', belly: '#d8f5c4', head: 'wide', ears: 'none', muzzle: 'none', tail: 'none', arms: 'paws', eyeY: -8 },
  lion: { name: 'lion', fur: '#f2b84b', shade: '#c9862e', belly: '#fff0cc', head: 'round', ears: 'bear', muzzle: 'round', tail: 'long', arms: 'paws', mane: '#c9762e' },
  pig: { name: 'pig', fur: '#ffb3c4', shade: '#f28aa3', belly: '#ffd6df', head: 'round', ears: 'pig', muzzle: 'snout', tail: 'curl', arms: 'paws' },
  sheep: { name: 'sheep', fur: '#fbf7f0', shade: '#5a4a44', belly: '#fff', head: 'round', ears: 'cow', muzzle: 'round', tail: 'puff', arms: 'paws', mane: '#ffffff' },
  mouse: { name: 'mouse', fur: '#c3cdd9', shade: '#98a5b5', belly: '#eef2f7', head: 'round', ears: 'mouse', muzzle: 'round', tail: 'long', arms: 'paws', nose: '#ff8fa3' },
  panda: { name: 'panda', fur: '#ffffff', shade: '#3b3b3b', belly: '#ffffff', head: 'round', ears: 'bear', muzzle: 'round', tail: 'puff', arms: 'paws' },
  tiger: { name: 'tiger', fur: '#f59a3a', shade: '#3b2a20', belly: '#fff3e0', head: 'wide', ears: 'cat', muzzle: 'round', tail: 'long', arms: 'paws', spots: true },
  penguin: { name: 'penguin', fur: '#3d4a5c', shade: '#26303d', belly: '#ffffff', head: 'egg', ears: 'none', muzzle: 'beak', tail: 'none', arms: 'fins' },
  hen: { name: 'hen', fur: '#ffffff', shade: '#e3d8c8', belly: '#fff', head: 'round', ears: 'none', muzzle: 'beak', tail: 'feathers', arms: 'wings', crest: '#e8553f' },
  squirrel: { name: 'squirrel', fur: '#c86b3c', shade: '#9c4f28', belly: '#ffe6cc', head: 'round', ears: 'cat', muzzle: 'round', tail: 'fox', arms: 'paws' },
  turtle: { name: 'turtle', fur: '#8fd16a', shade: '#4f9e45', belly: '#e9f7c9', head: 'round', ears: 'none', muzzle: 'none', tail: 'none', arms: 'paws' },
  goat: { name: 'goat', fur: '#efe6da', shade: '#a89580', belly: '#fff', head: 'round', ears: 'dog', muzzle: 'round', tail: 'puff', arms: 'paws' },
  bird: { name: 'bird', fur: '#5ab6e8', shade: '#3f8fc0', belly: '#dff3ff', head: 'round', ears: 'none', muzzle: 'beak', tail: 'feathers', arms: 'wings' },

  // People (varied looks)
  anu: { name: 'Anu', fur: '#c98b5f', shade: '#a86d45', belly: '#c98b5f', head: 'round', ears: 'human', muzzle: 'none', tail: 'none', arms: 'hands', hair: 'braids', hairColor: '#2b1d16', clothes: '#ff8a6b' },
  kid1: { name: 'child', fur: '#f2c9a5', shade: '#d9a77f', belly: '#f2c9a5', head: 'round', ears: 'human', muzzle: 'none', tail: 'none', arms: 'hands', hair: 'curly', hairColor: '#8a4b2a', clothes: '#5ab6e8' },
  kid2: { name: 'child', fur: '#8d5a3b', shade: '#6e4228', belly: '#8d5a3b', head: 'round', ears: 'human', muzzle: 'none', tail: 'none', arms: 'hands', hair: 'bun', hairColor: '#1f1410', clothes: '#9b6bd6' },
  kid3: { name: 'child', fur: '#e8b98f', shade: '#c9946a', belly: '#e8b98f', head: 'round', ears: 'human', muzzle: 'none', tail: 'none', arms: 'hands', hair: 'short', hairColor: '#3b2a20', clothes: '#6cbf4b' },
  kid4: { name: 'child', fur: '#b07a55', shade: '#8f5c3b', belly: '#b07a55', head: 'round', ears: 'human', muzzle: 'none', tail: 'none', arms: 'hands', hair: 'ponytail', hairColor: '#2b1d16', clothes: '#ffcb47' },
  grandma: { name: 'grandma', fur: '#e8bf98', shade: '#c99a70', belly: '#e8bf98', head: 'round', ears: 'human', muzzle: 'none', tail: 'none', arms: 'hands', hair: 'grey', hairColor: '#d8d8e0', clothes: '#c96fa8', glasses: true },
  grandpa: { name: 'grandpa', fur: '#a87150', shade: '#875736', belly: '#a87150', head: 'round', ears: 'human', muzzle: 'none', tail: 'none', arms: 'hands', hair: 'grey', hairColor: '#e6e6ea', clothes: '#4f88c8', glasses: true },
};

export const castIds = Object.keys(species);
export const mainCast = ['pip', 'bumble', 'luna', 'zig', 'coco'] as const;
