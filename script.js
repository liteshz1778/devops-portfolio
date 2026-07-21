// Live GitHub data — repo count only
(function fetchGitHubData(){
  const username = 'liteshz1778';

  fetch(`https://api.github.com/users/${username}`)
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(data => {
      if(typeof data.public_repos !== 'number') return;
      const statEl = document.getElementById('stat4');
      if(statEl){
        statEl.dataset.target = data.public_repos;
        const suffix = statEl.dataset.suffix || '';
        statEl.textContent = data.public_repos + suffix;
        statEl.classList.remove('loading');
      }
      const chip = document.getElementById('repoCountChip');
      if(chip) chip.textContent = data.public_repos + ' repos';
    })
    .catch(() => {
      // Fetch failed — fall back to the hardcoded data-target value instead
      // of leaving "Fetching…" showing forever.
      const statEl = document.getElementById('stat4');
      if(statEl){
        const suffix = statEl.dataset.suffix || '';
        statEl.textContent = statEl.dataset.target + suffix;
        statEl.classList.remove('loading');
      }
    });
})();

// Terminal typing effect
const lines = [
  { prompt: '$ ', text: 'kubectl get deployments -n prod', out: null },
  { prompt: '', text: null, out: 'litesh-devops-portfolio   1/1   1   1   6y' },
  { prompt: '$ ', text: 'echo $EXPERIENCE', out: null },
  { prompt: '', text: null, out: 'AWS · Terraform · Kubernetes · Jenkins · Ansible' },
];
const termBody = document.getElementById('termBody');
let li = 0, ci = 0;
function typeLine(){
  if(li >= lines.length){
    const p = document.createElement('div');
    p.className = 'term-line';
    p.innerHTML = '<span class="prompt">$</span> <span class="cursor"></span>';
    termBody.appendChild(p);
    return;
  }
  const line = lines[li];
  if(line.out !== null){
    const p = document.createElement('div');
    p.className = 'term-out';
    p.textContent = line.out;
    termBody.appendChild(p);
    li++; ci=0;
    setTimeout(typeLine, 260);
    return;
  }
  let el = termBody.querySelector('.typing-active');
  if(!el){
    el = document.createElement('div');
    el.className = 'term-line typing-active';
    el.innerHTML = '<span class="prompt">'+line.prompt+'</span><span class="txt"></span>';
    termBody.appendChild(el);
  }
  const txtEl = el.querySelector('.txt');
  if(ci <= line.text.length){
    txtEl.textContent = line.text.slice(0, ci);
    ci++;
    setTimeout(typeLine, 28);
  } else {
    el.classList.remove('typing-active');
    li++; ci=0;
    setTimeout(typeLine, 320);
  }
}
typeLine();

// Scroll spy for pipeline nav + rail fill
const stageLinks = document.querySelectorAll('.stage-link');
const targets = Array.from(stageLinks).map(l => document.getElementById(l.dataset.target));
stageLinks.forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById(link.dataset.target).scrollIntoView({behavior:'smooth'});
  });
});
function onScroll(){
  const scrollY = window.scrollY + 140;
  let activeIdx = 0;
  targets.forEach((t, i) => { if(t && t.offsetTop <= scrollY) activeIdx = i; });
  stageLinks.forEach((l,i) => l.classList.toggle('active', i === activeIdx));

  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct = Math.min(100, (window.scrollY / docH) * 100);
  const rail = document.getElementById('railFill');
  if(rail) rail.style.height = pct + '%';
}
document.addEventListener('scroll', onScroll);
onScroll();

// Live UTC clock
function updateClock(){
  const el = document.getElementById('clockText');
  if(el) el.textContent = new Date().toISOString().slice(11,19) + ' UTC';
}
setInterval(updateClock, 1000);
updateClock();

// Live session uptime
const startTime = Date.now();
function updateUptime(){
  const el = document.getElementById('uptime');
  if(!el) return;
  const s = Math.floor((Date.now() - startTime) / 1000);
  const hh = String(Math.floor(s/3600)).padStart(2,'0');
  const mm = String(Math.floor((s%3600)/60)).padStart(2,'0');
  const ss = String(s%60).padStart(2,'0');
  el.textContent = `${hh}:${mm}:${ss}`;
}
setInterval(updateUptime, 1000);

// Back to top button
const backToTop = document.getElementById('backToTop');
if(backToTop){
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  const toggleBackToTop = () => {
    backToTop.classList.toggle('visible', window.scrollY > 480);
  };
  document.addEventListener('scroll', toggleBackToTop);
  toggleBackToTop();
}

// Animated count-up stats, triggered once visible
const statEls = document.querySelectorAll('.stat-num');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const isDecimal = target % 1 !== 0;
      let cur = 0;
      const step = target / 40;
      const tick = () => {
        cur += step;
        if(cur >= target){
          el.textContent = (isDecimal ? target.toFixed(1) : target) + suffix;
        } else {
          el.textContent = (isDecimal ? cur.toFixed(1) : Math.floor(cur)) + suffix;
          requestAnimationFrame(tick);
        }
      };
      tick();
      statObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
statEls.forEach(el => { if(el.id !== 'stat4') statObserver.observe(el); });