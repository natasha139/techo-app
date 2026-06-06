// ── Techo Worker ─────────────────────────────────────────────────────────────
// Bindings: SELF_GROWTH_DB, PARENTING_DB, GENERAL_DB

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Sync-Code',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

function err(msg, status = 400) {
  return json({ error: msg }, status);
}

// ── Schema init ───────────────────────────────────────────────────────────────

async function initSchemas(env) {
  await env.SELF_GROWTH_DB.exec(`
    CREATE TABLE IF NOT EXISTS users (
      sync_code TEXT PRIMARY KEY,
      username TEXT NOT NULL DEFAULT 'Natasha',
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS wishes (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      ord INTEGER NOT NULL DEFAULT 0,
      content TEXT NOT NULL DEFAULT '',
      is_completed INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_started',
      category TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS skill_subgoals (
      id TEXT PRIMARY KEY,
      skill_id TEXT NOT NULL,
      sync_code TEXT NOT NULL,
      name TEXT NOT NULL,
      is_done INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS work_targets (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      quarter_goal TEXT NOT NULL DEFAULT '',
      key_results TEXT NOT NULL DEFAULT '',
      projects TEXT NOT NULL DEFAULT '',
      deadline TEXT NOT NULL DEFAULT '',
      progress INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS hobbies (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'book',
      creator TEXT NOT NULL DEFAULT '',
      last_date TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      rating INTEGER NOT NULL DEFAULT 0,
      cover_url TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS side_hustles (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      platform TEXT NOT NULL DEFAULT '',
      topic TEXT NOT NULL DEFAULT '',
      format TEXT NOT NULL DEFAULT 'other',
      publish_date TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'concept',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS diary_notes (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      weather TEXT,
      mood TEXT,
      category TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      tags TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    );
  `);

  await env.PARENTING_DB.exec(`
    CREATE TABLE IF NOT EXISTS child_milestones (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS child_logs (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      time TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT 'notes',
      spec TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS child_diaries (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      date TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      mood TEXT,
      height TEXT,
      weight TEXT,
      updated_at TEXT NOT NULL
    );
  `);

  await env.GENERAL_DB.exec(`
    CREATE TABLE IF NOT EXISTS planner_cells (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '',
      tag TEXT,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      name TEXT NOT NULL,
      history TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS weekly_summary (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      theme TEXT NOT NULL DEFAULT '',
      priorities TEXT NOT NULL DEFAULT '[]',
      practice TEXT NOT NULL DEFAULT '',
      reminder TEXT NOT NULL DEFAULT '',
      review_question TEXT NOT NULL DEFAULT '',
      today_notes TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS financial_metrics (
      id TEXT PRIMARY KEY,
      sync_code TEXT NOT NULL,
      month TEXT NOT NULL DEFAULT '',
      traffic INTEGER NOT NULL DEFAULT 0,
      revenue INTEGER NOT NULL DEFAULT 0,
      expense INTEGER NOT NULL DEFAULT 0,
      note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );
  `);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateSyncCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function now() {
  return new Date().toISOString();
}

// ── Self-Growth handler ───────────────────────────────────────────────────────

async function handleSelfGrowth(request, env, path, method, syncCode) {
  const db = env.SELF_GROWTH_DB;

  // Wishes
  if (path === '/api/self-growth/wishes') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM wishes WHERE sync_code = ? ORDER BY ord ASC'
      ).bind(syncCode).all();
      return json(results);
    }
    if (method === 'POST') {
      const body = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO wishes (id, sync_code, ord, content, is_completed, category, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(body.id, syncCode, body.order ?? 0, body.content ?? '', body.isCompleted ? 1 : 0, body.category ?? '', now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM wishes WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  // Bulk sync wishes
  if (path === '/api/self-growth/wishes/sync' && method === 'POST') {
    const items = await request.json();
    const stmt = db.prepare(
      'INSERT OR REPLACE INTO wishes (id, sync_code, ord, content, is_completed, category, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    await db.batch(items.map(w =>
      stmt.bind(w.id, syncCode, w.order ?? 0, w.content ?? '', w.isCompleted ? 1 : 0, w.category ?? '', now())
    ));
    return json({ ok: true });
  }

  // Skills
  if (path === '/api/self-growth/skills') {
    if (method === 'GET') {
      const { results: skillRows } = await db.prepare(
        'SELECT * FROM skills WHERE sync_code = ?'
      ).bind(syncCode).all();
      const { results: subRows } = await db.prepare(
        'SELECT * FROM skill_subgoals WHERE sync_code = ?'
      ).bind(syncCode).all();
      const skills = skillRows.map(s => ({
        ...s,
        status: s.status,
        subGoals: subRows.filter(sg => sg.skill_id === s.id).map(sg => ({
          id: sg.id, name: sg.name, isDone: sg.is_done === 1
        }))
      }));
      return json(skills);
    }
    if (method === 'POST') {
      const body = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO skills (id, sync_code, skill_name, status, category, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(body.id, syncCode, body.skillName, body.status ?? 'not_started', body.category ?? '', now()).run();
      if (body.subGoals) {
        await db.prepare('DELETE FROM skill_subgoals WHERE skill_id = ? AND sync_code = ?').bind(body.id, syncCode).run();
        if (body.subGoals.length > 0) {
          const stmt = db.prepare(
            'INSERT INTO skill_subgoals (id, skill_id, sync_code, name, is_done, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
          );
          await db.batch(body.subGoals.map(sg =>
            stmt.bind(sg.id, body.id, syncCode, sg.name, sg.isDone ? 1 : 0, now())
          ));
        }
      }
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.batch([
        db.prepare('DELETE FROM skills WHERE id = ? AND sync_code = ?').bind(id, syncCode),
        db.prepare('DELETE FROM skill_subgoals WHERE skill_id = ? AND sync_code = ?').bind(id, syncCode),
      ]);
      return json({ ok: true });
    }
  }

  // Work targets
  if (path === '/api/self-growth/work') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM work_targets WHERE sync_code = ?'
      ).bind(syncCode).all();
      return json(results.map(r => ({
        id: r.id, quarterGoal: r.quarter_goal, keyResults: r.key_results,
        projects: r.projects, deadline: r.deadline, progress: r.progress
      })));
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO work_targets (id, sync_code, quarter_goal, key_results, projects, deadline, progress, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.quarterGoal ?? '', b.keyResults ?? '', b.projects ?? '', b.deadline ?? '', b.progress ?? 0, now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM work_targets WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  // Hobbies
  if (path === '/api/self-growth/hobbies') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM hobbies WHERE sync_code = ?'
      ).bind(syncCode).all();
      return json(results.map(r => ({
        id: r.id, title: r.title, type: r.type, creator: r.creator,
        lastDate: r.last_date, description: r.description, rating: r.rating, coverUrl: r.cover_url
      })));
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO hobbies (id, sync_code, title, type, creator, last_date, description, rating, cover_url, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.title, b.type ?? 'book', b.creator ?? '', b.lastDate ?? '', b.description ?? '', b.rating ?? 0, b.coverUrl ?? null, now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM hobbies WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  // Side hustles
  if (path === '/api/self-growth/side-hustles') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM side_hustles WHERE sync_code = ?'
      ).bind(syncCode).all();
      return json(results.map(r => ({
        id: r.id, platform: r.platform, topic: r.topic, format: r.format,
        publishDate: r.publish_date, status: r.status
      })));
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO side_hustles (id, sync_code, platform, topic, format, publish_date, status, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.platform ?? '', b.topic ?? '', b.format ?? 'other', b.publishDate ?? '', b.status ?? 'concept', now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM side_hustles WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  // Diary notes (self-growth)
  if (path === '/api/self-growth/diary') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM diary_notes WHERE sync_code = ? ORDER BY date DESC'
      ).bind(syncCode).all();
      return json(results.map(r => ({
        id: r.id, title: r.title, date: r.date, weather: r.weather,
        mood: r.mood, category: r.category, content: r.content,
        tags: JSON.parse(r.tags || '[]')
      })));
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO diary_notes (id, sync_code, title, date, weather, mood, category, content, tags, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.title ?? '', b.date ?? '', b.weather ?? null, b.mood ?? null, b.category ?? '', b.content ?? '', JSON.stringify(b.tags ?? []), now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM diary_notes WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  return err('Not found', 404);
}

// ── Parenting handler ─────────────────────────────────────────────────────────

async function handleParenting(request, env, path, method, syncCode) {
  const db = env.PARENTING_DB;

  // Milestones
  if (path === '/api/parenting/milestones') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM child_milestones WHERE sync_code = ? ORDER BY date DESC'
      ).bind(syncCode).all();
      return json(results);
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO child_milestones (id, sync_code, title, date, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.title ?? '', b.date ?? '', b.notes ?? '', now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM child_milestones WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  // Child logs
  if (path === '/api/parenting/logs') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM child_logs WHERE sync_code = ? ORDER BY time ASC'
      ).bind(syncCode).all();
      return json(results);
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO child_logs (id, sync_code, time, type, spec, notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.time ?? '', b.type ?? 'notes', b.spec ?? '', b.notes ?? '', now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM child_logs WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  // Child diaries
  if (path === '/api/parenting/diary') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM child_diaries WHERE sync_code = ? ORDER BY date DESC'
      ).bind(syncCode).all();
      return json(results);
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO child_diaries (id, sync_code, date, title, content, mood, height, weight, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.date ?? '', b.title ?? '', b.content ?? '', b.mood ?? null, b.height ?? null, b.weight ?? null, now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM child_diaries WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  return err('Not found', 404);
}

// ── General handler ───────────────────────────────────────────────────────────

async function handleGeneral(request, env, path, method, syncCode) {
  const db = env.GENERAL_DB;

  // Planner cells
  if (path === '/api/general/cells') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM planner_cells WHERE sync_code = ?'
      ).bind(syncCode).all();
      return json(results);
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO planner_cells (id, sync_code, text, color, tag, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.text ?? '', b.color ?? '', b.tag ?? null, now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM planner_cells WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  // Bulk sync cells
  if (path === '/api/general/cells/sync' && method === 'POST') {
    const items = await request.json();
    await db.prepare('DELETE FROM planner_cells WHERE sync_code = ?').bind(syncCode).run();
    if (items.length > 0) {
      const stmt = db.prepare(
        'INSERT INTO planner_cells (id, sync_code, text, color, tag, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      );
      await db.batch(items.map(c =>
        stmt.bind(c.id, syncCode, c.text ?? '', c.color ?? '', c.tag ?? null, now())
      ));
    }
    return json({ ok: true });
  }

  // Habits
  if (path === '/api/general/habits') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM habits WHERE sync_code = ?'
      ).bind(syncCode).all();
      return json(results.map(r => ({
        id: r.id, name: r.name, history: JSON.parse(r.history || '{}')
      })));
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO habits (id, sync_code, name, history, updated_at) VALUES (?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.name, JSON.stringify(b.history ?? {}), now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM habits WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  // Weekly summary
  if (path === '/api/general/weekly-summary') {
    if (method === 'GET') {
      const row = await db.prepare(
        'SELECT * FROM weekly_summary WHERE sync_code = ? LIMIT 1'
      ).bind(syncCode).first();
      if (!row) return json(null);
      return json({
        theme: row.theme,
        priorities: JSON.parse(row.priorities || '[]'),
        practice: row.practice,
        reminder: row.reminder,
        reviewQuestion: row.review_question,
        todayNotes: JSON.parse(row.today_notes || '{}'),
      });
    }
    if (method === 'POST') {
      const b = await request.json();
      const existing = await db.prepare(
        'SELECT id FROM weekly_summary WHERE sync_code = ? LIMIT 1'
      ).bind(syncCode).first();
      const id = existing?.id || `ws_${Date.now()}`;
      await db.prepare(
        'INSERT OR REPLACE INTO weekly_summary (id, sync_code, theme, priorities, practice, reminder, review_question, today_notes, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(id, syncCode, b.theme ?? '', JSON.stringify(b.priorities ?? []), b.practice ?? '', b.reminder ?? '', b.reviewQuestion ?? '', JSON.stringify(b.todayNotes ?? {}), now()).run();
      return json({ ok: true });
    }
  }

  // Financial metrics
  if (path === '/api/general/finance') {
    if (method === 'GET') {
      const { results } = await db.prepare(
        'SELECT * FROM financial_metrics WHERE sync_code = ? ORDER BY month DESC'
      ).bind(syncCode).all();
      return json(results);
    }
    if (method === 'POST') {
      const b = await request.json();
      await db.prepare(
        'INSERT OR REPLACE INTO financial_metrics (id, sync_code, month, traffic, revenue, expense, note, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
      ).bind(b.id, syncCode, b.month ?? '', b.traffic ?? 0, b.revenue ?? 0, b.expense ?? 0, b.note ?? '', now()).run();
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const id = new URL(request.url).searchParams.get('id');
      await db.prepare('DELETE FROM financial_metrics WHERE id = ? AND sync_code = ?').bind(id, syncCode).run();
      return json({ ok: true });
    }
  }

  return err('Not found', 404);
}
