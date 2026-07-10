// Slack-style :name: emoji completion. A curated dictionary keeps the bundle
// tiny (full emoji indexes are ~100 KB); names follow Slack's conventions so
// muscle memory works.

export const EMOJI = {
  // faces
  smile: '😄', grin: '😁', joy: '😂', rofl: '🤣', sweat_smile: '😅',
  blush: '😊', wink: '😉', heart_eyes: '😍', smiling_face_with_hearts: '🥰',
  kissing_heart: '😘', yum: '😋', stuck_out_tongue: '😛', zany: '🤪',
  thinking: '🤔', shush: '🤫', neutral_face: '😐', roll_eyes: '🙄',
  grimacing: '😬', relieved: '😌', sleeping: '😴', upside_down: '🙃',
  melting: '🫠', salute: '🫡', holding_back_tears: '🥹', pleading: '🥺',
  cry: '😢', sob: '😭', scream: '😱', flushed: '😳', hot: '🥵', cold: '🥶',
  exploding_head: '🤯', mind_blown: '🤯', partying_face: '🥳',
  sunglasses: '😎', nerd: '🤓', monocle: '🧐', angry: '😠', rage: '😡',
  smiling_imp: '😈', clown: '🤡', ghost: '👻', alien: '👽', robot: '🤖',
  skull: '💀', poop: '💩',
  // hearts
  heart: '❤️', purple_heart: '💜', blue_heart: '💙', green_heart: '💚',
  yellow_heart: '💛', orange_heart: '🧡', black_heart: '🖤', white_heart: '🤍',
  pink_heart: '🩷', sparkling_heart: '💖', two_hearts: '💕', broken_heart: '💔',
  heart_on_fire: '❤️‍🔥',
  // hands
  wave: '👋', clap: '👏', raised_hands: '🙌', heart_hands: '🫶', pray: '🙏',
  handshake: '🤝', muscle: '💪', point_up: '☝️', crossed_fingers: '🤞',
  victory: '✌️', ok_hand: '👌', pinched_fingers: '🤌', '+1': '👍',
  thumbsup: '👍', '-1': '👎', thumbsdown: '👎',
  // celebration & symbols
  tada: '🎉', confetti_ball: '🎊', balloon: '🎈', gift: '🎁', trophy: '🏆',
  medal: '🏅', crown: '👑', gem: '💎', fire: '🔥', 100: '💯', sparkles: '✨',
  star: '⭐', star2: '🌟', dizzy: '💫', zap: '⚡', boom: '💥', eyes: '👀',
  brain: '🧠', bulb: '💡', rocket: '🚀', question: '❓', exclamation: '❗',
  white_check_mark: '✅', x: '❌', warning: '⚠️', wave_dash: '〰️',
  speech_balloon: '💬', thought_balloon: '💭', zzz: '💤',
  // animals & nature
  octopus: '🐙', unicorn: '🦄', cat: '🐱', dog: '🐶', butterfly: '🦋',
  bee: '🐝', snail: '🐌', turtle: '🐢', penguin: '🐧', owl: '🦉', duck: '🦆',
  whale: '🐳', dolphin: '🐬', crab: '🦀', dragon: '🐉',
  cherry_blossom: '🌸', rose: '🌹', tulip: '🌷', sunflower: '🌻',
  seedling: '🌱', palm_tree: '🌴', four_leaf_clover: '🍀',
  sun: '☀️', moon: '🌙', rainbow: '🌈', cloud: '☁️', snowflake: '❄️',
  earth: '🌎', ocean: '🌊',
  // food & drink
  coffee: '☕', tea: '🍵', beer: '🍺', wine_glass: '🍷', champagne: '🍾',
  clinking_glasses: '🥂', pizza: '🍕', taco: '🌮', ramen: '🍜', sushi: '🍣',
  cake: '🍰', birthday: '🎂', cookie: '🍪', doughnut: '🍩', ice_cream: '🍦',
  strawberry: '🍓', watermelon: '🍉', avocado: '🥑',
  // school & work
  book: '📖', books: '📚', pencil: '✏️', memo: '📝', computer: '💻',
  microscope: '🔬', telescope: '🔭', chart_with_upwards_trend: '📈',
  bar_chart: '📊', mortar_board: '🎓', microphone: '🎤', clipboard: '📋',
  calendar: '📅', bell: '🔔', mega: '📣', hourglass: '⌛',
}

const NAMES = Object.keys(EMOJI)

// Ranked search: exact match, then prefix matches (shortest first), then
// substring matches.
export function searchEmoji(query, limit = 8) {
  const q = query.toLowerCase()
  if (!q) return []
  const exact = []
  const starts = []
  const contains = []
  for (const name of NAMES) {
    if (name === q) exact.push(name)
    else if (name.startsWith(q)) starts.push(name)
    else if (name.includes(q)) contains.push(name)
  }
  starts.sort((a, b) => a.length - b.length)
  return [...exact, ...starts, ...contains]
    .slice(0, limit)
    .map((name) => ({ name, emoji: EMOJI[name] }))
}

// If the text ends in an unfinished ":name" token (≥2 chars, colon preceded
// by start-of-text or whitespace), return the partial name — else null.
// The whitespace guard keeps URLs like http://x from triggering.
export function completionQuery(textBeforeCaret) {
  const m = /(?:^|\s):([a-z0-9_+-]{2,})$/i.exec(textBeforeCaret)
  return m ? m[1].toLowerCase() : null
}

// Replace the trailing ":partial" with the chosen emoji.
export function applyCompletion(text, emoji) {
  return text.replace(/:[a-z0-9_+-]+$/i, emoji)
}

// If the text ends in a complete ":name:" that we know, swap it for the emoji
// (typing the closing colon converts inline, like Slack). Else return null.
export function autoReplace(text) {
  const m = /(?:^|\s):([a-z0-9_+-]+):$/i.exec(text)
  if (!m) return null
  const emoji = EMOJI[m[1].toLowerCase()]
  return emoji ? text.slice(0, text.length - m[1].length - 2) + emoji : null
}
