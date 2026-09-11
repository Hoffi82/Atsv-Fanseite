(function(){
  'use strict';
  const URL='https://xmtrtpibldbiiikkkmnd.supabase.co';
  const KEY='sb_publishable_5dbkLVYmSklCiPcjzzFk1g_ANJoqy9B';
  const headers={apikey:KEY,Authorization:'Bearer '+KEY};
  const $=id=>document.getElementById(id);
  async function get(path){const r=await fetch(URL+'/rest/v1/'+path,{headers,cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
  async function refresh(){
    try{
      let matches=await get('live_matches?select=*&status=eq.live&order=created_at.desc&limit=1');
      if(!matches.length) matches=await get('live_matches?select=*&status=eq.upcoming&order=created_at.desc&limit=1');
      const m=matches[0];
      if(!m){$('homeLiveStatus').textContent='KEIN SPIEL LIVE';$('homeLiveScore').textContent='–:–';$('homeLiveMinute').innerHTML='Spielminute: <strong>-</strong>';$('homeLiveEvents').textContent='Aktuell findet kein Spiel statt.';return;}
      $('homeLiveHome').textContent=m.home_team||'ATSV Forchheim';$('homeLiveAway').textContent=m.away_team||'Gegner';$('homeLiveScore').textContent=(m.home_score??0)+' : '+(m.away_score??0);
      if(m.status==='live'){
        $('homeLiveStatus').textContent='🔴 LIVE';
        let min=m.current_minute??1;if(m.live_started_at){min=Math.min(120,Math.max(1,Math.floor((Date.now()-new Date(m.live_started_at).getTime())/60000)+1));}
        $('homeLiveMinute').innerHTML='Spielminute: <strong>'+min+'</strong>';
      }else{$('homeLiveStatus').textContent='📅 VORBEREITET';$('homeLiveMinute').innerHTML='Spielminute: <strong>-</strong>';}
      const events=await get('live_events?select=*&match_id=eq.'+encodeURIComponent(m.id)+'&order=created_at.desc&limit=5');
      $('homeLiveEvents').innerHTML=events.length?events.map(e=>'<div class="home-live-no-events"><strong style="color:#d00020">'+(e.minute??'-')+"'</strong> "+(e.description||e.event_type||'Ereignis')+'</div>').join(''):'Aktuell keine Ereignisse.';
    }catch(e){console.warn('ATSV Live-Ticker:',e);}
  }
  function init(){if(!$('homeLiveStatus'))return;refresh();setInterval(refresh,30000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
