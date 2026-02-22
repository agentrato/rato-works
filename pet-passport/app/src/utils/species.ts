const SPECIES_EMOJI: Record<string, string> = {
  Dog: '\uD83D\uDC15',
  Cat: '\uD83D\uDC31',
  Bird: '\uD83E\uDD9C',
  Rabbit: '\uD83D\uDC07',
  Hamster: '\uD83D\uDC39',
  Fish: '\uD83D\uDC20',
  Turtle: '\uD83D\uDC22',
  Snake: '\uD83D\uDC0D',
  Lizard: '\uD83E\uDD8E',
  Horse: '\uD83D\uDC34',
  Ferret: '\uD83E\uDDA6',
  'Guinea Pig': '\uD83D\uDC39',
};

export function speciesEmoji(species: string): string {
  return SPECIES_EMOJI[species] || '\uD83D\uDC3E';
}
