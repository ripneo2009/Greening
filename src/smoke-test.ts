import { readFile } from 'node:fs/promises';
import { pool } from './database/pool.js';

const base = `http://localhost:${process.env.PORT || 4000}`;
const email = `smoke-${Date.now()}@example.com`;
const password = 'Greening-Smoke-2026!';
let userId = '';

async function json(path: string, init?: RequestInit) {
  const response = await fetch(`${base}${path}`, init);
  const body = await response.json();
  if (!response.ok) throw new Error(`${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

try {
  const registration = await json('/api/v1/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password,displayName:'흐름검증'}) });
  userId = registration.user.id;
  const login = await json('/api/v1/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) });
  const auth = { Authorization: `Bearer ${login.accessToken}` };
  const catalog = await json('/api/v1/plants');
  const space = await json('/api/v1/spaces', { method:'POST', headers:{...auth,'Content-Type':'application/json'}, body:JSON.stringify({name:'검증 공간',lifestyle:{level:'beginner'}}) });
  const form = new FormData();
  form.append('image', new Blob([await readFile(new URL('../web/public/og.png', import.meta.url))], {type:'image/png'}), 'room.png');
  await json(`/api/v1/spaces/${space.id}/analyze`, {method:'POST',headers:auth,body:form});
  const recs = await json(`/api/v1/spaces/${space.id}/recommendations`, {method:'POST',headers:auth});
  const adopted = await json('/api/v1/my-plants', {method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({plantId:catalog.items[0].id,nickname:'테스트잎'})});
  const careLog = await json(`/api/v1/my-plants/${adopted.id}/logs`, {method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({note:'건강 상태 확인',activityType:'watering'})});
  const questList = await json('/api/v1/quests', {headers:auth});
  const pointState = await json('/api/v1/points', {headers:auth});
  await pool.query('UPDATE users SET points=2000 WHERE id=$1',[userId]);
  const redemption = await json(`/api/v1/points/redeem/${pointState.shop[0].id}`, {method:'POST',headers:auth});
  console.log(JSON.stringify({register:true,login:true,spaceAnalysis:true,recommendations:recs.items.length,diary:true,pointsAwarded:careLog.pointsAwarded,pointShopItems:pointState.shop.length,redemption:!!redemption.item,quests:questList.items.length}));
} finally {
  if (userId) await pool.query('DELETE FROM users WHERE id=$1',[userId]);
  await pool.end();
}
