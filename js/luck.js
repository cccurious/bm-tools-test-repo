document.addEventListener('DOMContentLoaded', () => {
    // Seeded Random Generator (Mulberry32)
    function mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ t >>> 15, t | 1);
          t ^= t + Math.imul(t ^ t >>> 7, t | 61);
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    const luckCalcBtn = document.getElementById('luck-calc-btn');
    const luckResultSec = document.getElementById('luck-result-section');
    const luckScoreEl = document.getElementById('luck-result-score');
    const luckTextEl = document.getElementById('luck-result-text');

    if(luckCalcBtn) {
        luckCalcBtn.addEventListener('click', () => {
            const initialTickets = 0; // We calculate deficit without initial tickets
            const multiplier = parseFloat(document.getElementById('target-card-multiplier').value);
            const otherCards = parseFloat(document.getElementById('other-card-count').value);
            const urRate = parseFloat(document.getElementById('total-ur-rate').value) / 100;
            const pastPulls = parseInt(document.getElementById('luck-pulls-input').value) || 0;

            const pSpecific = (1 * multiplier) / ((App.numCards * multiplier) + otherCards) * urRate;

            let needs = App.stateLuck.map(s => Math.max(0, s.current)); // actual acquired
            let totalAcquired = needs.reduce((a, b) => a + b, 0);

            if (pastPulls <= 0) {
                luckScoreEl.innerText = '--.-';
                luckTextEl.innerText = '回数を入力してください';
                luckTextEl.style.color = '#fff';
                luckResultSec.classList.remove('hidden');
                return;
            }

            const originalText = luckCalcBtn.innerHTML;
            luckCalcBtn.disabled = true;
            luckCalcBtn.innerHTML = '<span class="spinner"></span>判定中...';
            luckCalcBtn.style.opacity = '0.8';
            luckCalcBtn.style.cursor = 'not-allowed';

            setTimeout(() => {
                const currentTickets = parseInt(document.getElementById('current-tickets').value) || 0;
                const earnedTickets = Math.floor(pastPulls / App.CONFIG.NORMAL.PULLS_FOR_TICKET);
                const spentTickets = Math.max(0, earnedTickets - currentTickets);
                const exchangedCards = Math.floor(spentTickets / App.CONFIG.NORMAL.TICKETS_FOR_EXCHANGE);
                
                let pureGachaHits = Math.max(0, totalAcquired - exchangedCards);

                const expectedRate = pSpecific * App.numCards;
                const expectedValue = pastPulls * expectedRate;
                const variance = pastPulls * expectedRate * (1 - expectedRate);
                const stdDev = Math.sqrt(variance);

                let zScore = 0;
                if (stdDev > 0) {
                    zScore = (pureGachaHits - expectedValue) / stdDev;
                }
                
                let tScore = 50 + (zScore * 10);
                tScore = Math.max(10, Math.min(100, tScore));

                luckScoreEl.innerText = tScore.toFixed(1);
                
                if (tScore >= 70) {
                    luckTextEl.innerText = '神引き！超絶上振れ！';
                    luckTextEl.style.color = '#f56565';
                    luckResultSec.style.borderColor = '#f56565';
                    luckScoreEl.style.color = '#f56565';
                } else if (tScore >= 60) {
                    luckTextEl.innerText = '上振れ！運がいいですね！';
                    luckTextEl.style.color = '#ed8936';
                    luckResultSec.style.borderColor = '#ed8936';
                    luckScoreEl.style.color = '#ed8936';
                } else if (tScore >= 45) {
                    luckTextEl.innerText = '普通（確率通り）です';
                    luckTextEl.style.color = '#48bb78';
                    luckResultSec.style.borderColor = '#48bb78';
                    luckScoreEl.style.color = '#48bb78';
                } else if (tScore >= 35) {
                    luckTextEl.innerText = '下振れ...少し運が悪いかも';
                    luckTextEl.style.color = '#4299e1';
                    luckResultSec.style.borderColor = '#4299e1';
                    luckScoreEl.style.color = '#4299e1';
                } else {
                    luckTextEl.innerText = '大爆死...元気を出して...';
                    luckTextEl.style.color = '#9f7aea';
                    luckResultSec.style.borderColor = '#9f7aea';
                    luckScoreEl.style.color = '#9f7aea';
                }

                luckResultSec.classList.remove('hidden');
                setTimeout(() => luckResultSec.classList.add('show'), 10);
                setTimeout(() => { luckResultSec.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, 100);

                luckCalcBtn.disabled = false;
                luckCalcBtn.innerHTML = originalText;
                luckCalcBtn.style.opacity = '1';
                luckCalcBtn.style.cursor = 'pointer';

                if(window.triggerSupportBanner) window.triggerSupportBanner();

            }, 50);
        });
    }

    const resetLuckBtn = document.getElementById('reset-luck-btn');
    if (resetLuckBtn) {
        resetLuckBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo(0, 0);
            luckResultSec.classList.remove('show');
            setTimeout(() => luckResultSec.classList.add('hidden'), 300);
        });
    }
});
