// techo-cron: 每天 UTC 0:00（北京时间 8:00）推送 Bark 提醒

async function sendBark(barkUrl, title, body) {
  const url = `${barkUrl}/${encodeURIComponent(title)}/${encodeURIComponent(body)}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group: 'techo', isArchive: 1 }),
  }).catch(() => {});
}

async function runReminders(env) {
  const db = env.GENERAL_DB;

  // 取所有用户的 bark_url
  const { results: barkRows } = await db.prepare(
    "SELECT sync_code, value FROM settings WHERE key = 'bark_url'"
  ).all();

  if (!barkRows.length) return;

  const today = new Date().toISOString().split('T')[0];

  for (const { sync_code, value: barkUrl } of barkRows) {
    if (!barkUrl) continue;
    const cleanUrl = barkUrl.replace(/\/$/, '');

    // 查找今天需要提醒的事项：date - advance_days <= today <= date，且未完成
    const { results } = await db.prepare(`
      SELECT title, date, advance_days, note
      FROM reminders
      WHERE sync_code = ?
        AND is_done = 0
        AND date(date, '-' || advance_days || ' days') <= ?
        AND date <= ?
      ORDER BY date ASC
    `).bind(sync_code, today, today).all();

    if (!results.length) continue;

    for (const r of results) {
      const daysLeft = Math.round((new Date(r.date) - new Date(today)) / 86400000);
      const when = daysLeft === 0 ? '今天' : daysLeft === 1 ? '明天' : `${daysLeft}天后`;
      const body = r.note ? `${when} · ${r.note}` : when;
      await sendBark(cleanUrl, `📅 ${r.title}`, body);
    }
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(runReminders(env));
  },
  // 开发调试用：GET /test 手动触发
  async fetch(request, env) {
    if (new URL(request.url).pathname === '/test') {
      await runReminders(env);
      return new Response('done');
    }
    return new Response('techo-cron ok');
  },
};
