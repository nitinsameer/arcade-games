/**
 * Profile Page Renderer
 * Edit player profile information
 */

/**
 * Render profile page
 * @param {Object} state - Application state
 * @param {Object} route - Route information
 * @returns {string} HTML content
 */
export function renderProfile(state, route) {
  const totalStats = {
    stars: state.stars || 0,
    gamesPlayed: Object.values(state.gb || {}).filter(s => s > 0).length,
    lessonsCompleted: Object.values(state.done || {}).reduce((acc, done) => acc + (done?.length || 0), 0),
    totalCoin: state.coin || 0
  }

  return `
    <div class="phone">
      <div class="top">
        <button class="back" data-go="/settings" style="background: none; border: none; cursor: pointer; font-size: 24px; padding: 0">←</button>
        <h1 style="margin: 0; flex: 1; text-align: center">Profile</h1>
        <div class="star" style="font-size: 18px; padding: 8px 16px">${state.stars || 0} ⭐</div>
      </div>

      <div class="raise" style="padding: 24px; border-radius: var(--r); box-shadow: var(--sh); margin-top: 24px; text-align: center">
        <div style="font-size: 64px; margin-bottom: 16px">👤</div>
        <h2 style="margin: 0 0 8px 0; font-size: 18px">${state.name || 'Explorer'}</h2>
        <div style="font-size: 12px; color: var(--mute)">Player since today</div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">STATISTICS</h2>
        
        <div class="stats-grid">
          <div class="stat-card raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); text-align: center">
            <div style="font-size: 32px; margin-bottom: 8px">⭐</div>
            <div style="font-weight: 800; font-size: 20px">${totalStats.stars}</div>
            <div style="font-size: 11px; color: var(--mute); margin-top: 4px">Stars Earned</div>
          </div>
          
          <div class="stat-card raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); text-align: center">
            <div style="font-size: 32px; margin-bottom: 8px">🎮</div>
            <div style="font-weight: 800; font-size: 20px">${totalStats.gamesPlayed}</div>
            <div style="font-size: 11px; color: var(--mute); margin-top: 4px">Games Played</div>
          </div>
          
          <div class="stat-card raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); text-align: center">
            <div style="font-size: 32px; margin-bottom: 8px">📚</div>
            <div style="font-weight: 800; font-size: 20px">${totalStats.lessonsCompleted}</div>
            <div style="font-size: 11px; color: var(--mute); margin-top: 4px">Lessons Done</div>
          </div>
          
          <div class="stat-card raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh); text-align: center">
            <div style="font-size: 32px; margin-bottom: 8px">💰</div>
            <div style="font-weight: 800; font-size: 20px">${totalStats.totalCoin}</div>
            <div style="font-size: 11px; color: var(--mute); margin-top: 4px">Total Coins</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 24px">
        <h2 style="font-size: 14px; font-weight: 800; margin: 0 0 12px 0; color: var(--mute)">EDIT PROFILE</h2>
        
        <div class="raise" style="padding: 16px; border-radius: var(--r); box-shadow: var(--sh)">
          <label style="display: block; font-weight: 700; margin-bottom: 8px">Player Name</label>
          <input 
            type="text" 
            id="playerName"
            value="${state.name || 'Explorer'}"
            placeholder="Enter your name"
            maxlength="20"
            style="
              width: 100%;
              padding: 12px;
              border: none;
              border-radius: var(--rs);
              background: var(--well);
              color: var(--ink);
              font-family: inherit;
              font-size: 14px;
              box-sizing: border-box;
            "
          />
          <button 
            class="cta" 
            data-act="saveName"
            style="width: 100%; margin-top: 12px"
          >
            Save Name
          </button>
        </div>
      </div>

      <style>
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .stat-card {
          background: var(--card);
        }
        .back {
          font-size: 24px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rs);
        }
        .back:active {
          background: var(--card);
        }
      </style>
    </div>
  `
}
