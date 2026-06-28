-- ============================================================
--  Daily Study — seed content
--  Safe to run multiple times (idempotent via ON CONFLICT).
-- ============================================================

-- Languages -------------------------------------------------
insert into public.languages (code, name_native, name_ko, flag) values
  ('ko', '한국어',   '한국어',   '🇰🇷'),
  ('en', 'English',  '영어',     '🇺🇸'),
  ('ja', '日本語',   '일본어',   '🇯🇵'),
  ('zh', '中文',     '중국어',   '🇨🇳'),
  ('es', 'Español',  '스페인어', '🇪🇸'),
  ('fr', 'Français', '프랑스어', '🇫🇷')
on conflict (code) do nothing;

-- Decks -----------------------------------------------------
insert into public.decks (id, title, description, source_lang, target_lang, level, sort_order) values
  ('11111111-1111-1111-1111-111111111111', '기초 영단어',     '일상에서 가장 자주 쓰는 기초 영어 단어',   'ko', 'en', 'beginner',     1),
  ('22222222-2222-2222-2222-222222222222', '생활 영어 표현',   '바로 써먹는 자연스러운 생활 영어 표현',     'ko', 'en', 'intermediate', 2),
  ('33333333-3333-3333-3333-333333333333', '기초 일본어 단어', '히라가나 읽기와 함께 배우는 기초 일본어',   'ko', 'ja', 'beginner',     1)
on conflict (id) do nothing;

-- Cards: 기초 영단어 ----------------------------------------
insert into public.cards (deck_id, term, reading, meaning, example, example_meaning, sort_order) values
  ('11111111-1111-1111-1111-111111111111', 'apple',     null, '사과',          'I eat an apple every day.',     '나는 매일 사과를 먹어요.',          1),
  ('11111111-1111-1111-1111-111111111111', 'water',     null, '물',            'Can I have some water?',        '물 좀 주시겠어요?',                2),
  ('11111111-1111-1111-1111-111111111111', 'friend',    null, '친구',          'She is my best friend.',        '그녀는 내 가장 친한 친구예요.',     3),
  ('11111111-1111-1111-1111-111111111111', 'book',      null, '책',            'I am reading a good book.',     '나는 좋은 책을 읽고 있어요.',       4),
  ('11111111-1111-1111-1111-111111111111', 'house',     null, '집',            'Their house is very big.',      '그들의 집은 매우 커요.',            5),
  ('11111111-1111-1111-1111-111111111111', 'school',    null, '학교',          'I go to school by bus.',        '나는 버스로 학교에 가요.',          6),
  ('11111111-1111-1111-1111-111111111111', 'happy',     null, '행복한',        'I am so happy today.',          '오늘 정말 행복해요.',              7),
  ('11111111-1111-1111-1111-111111111111', 'eat',       null, '먹다',          'Let us eat lunch together.',    '함께 점심 먹어요.',                8),
  ('11111111-1111-1111-1111-111111111111', 'work',      null, '일하다, 일',    'I work from home.',             '나는 재택근무를 해요.',            9),
  ('11111111-1111-1111-1111-111111111111', 'time',      null, '시간',          'What time is it?',              '지금 몇 시예요?',                  10),
  ('11111111-1111-1111-1111-111111111111', 'money',     null, '돈',            'I need to save money.',         '나는 돈을 모아야 해요.',           11),
  ('11111111-1111-1111-1111-111111111111', 'love',      null, '사랑하다, 사랑', 'I love this city.',            '나는 이 도시를 사랑해요.',          12),
  ('11111111-1111-1111-1111-111111111111', 'study',     null, '공부하다',      'I study English every morning.', '나는 매일 아침 영어를 공부해요.',  13),
  ('11111111-1111-1111-1111-111111111111', 'travel',    null, '여행하다',      'I want to travel the world.',   '나는 세계를 여행하고 싶어요.',      14),
  ('11111111-1111-1111-1111-111111111111', 'beautiful', null, '아름다운',      'What a beautiful day!',         '정말 아름다운 날이에요!',          15)
on conflict do nothing;

-- Cards: 생활 영어 표현 -------------------------------------
insert into public.cards (deck_id, term, reading, meaning, example, example_meaning, sort_order) values
  ('22222222-2222-2222-2222-222222222222', 'How''s it going?',        null, '어떻게 지내요?',      'Hey, how''s it going?',                   '안녕, 어떻게 지내?',                 1),
  ('22222222-2222-2222-2222-222222222222', 'I have no idea.',         null, '전혀 모르겠어요.',    'Where is he? I have no idea.',            '그 사람 어디 있어? 전혀 모르겠어.',  2),
  ('22222222-2222-2222-2222-222222222222', 'Sounds good!',            null, '좋아요!',            'Dinner at seven? Sounds good!',           '7시에 저녁? 좋아요!',               3),
  ('22222222-2222-2222-2222-222222222222', 'Take your time.',         null, '천천히 하세요.',      'No rush, take your time.',                '서두르지 말고 천천히 하세요.',       4),
  ('22222222-2222-2222-2222-222222222222', 'It''s up to you.',        null, '당신에게 달렸어요.',  'Where should we eat? It''s up to you.',   '어디서 먹을까? 너한테 맡길게.',      5),
  ('22222222-2222-2222-2222-222222222222', 'I''m starving.',          null, '배고파 죽겠어요.',    'Let''s eat, I''m starving.',              '먹자, 배고파 죽겠어.',              6),
  ('22222222-2222-2222-2222-222222222222', 'No worries.',             null, '걱정 마세요.',        'I''m late, sorry! No worries.',           '늦어서 미안해! 걱정 마.',            7),
  ('22222222-2222-2222-2222-222222222222', 'That makes sense.',       null, '그거 말 되네요.',     'Oh, that makes sense now.',               '아, 이제 말이 되네요.',             8),
  ('22222222-2222-2222-2222-222222222222', 'Let me think about it.',  null, '생각해 볼게요.',      'Good offer. Let me think about it.',      '좋은 제안이네요. 생각해 볼게요.',    9),
  ('22222222-2222-2222-2222-222222222222', 'Catch you later.',        null, '나중에 봐요.',        'I have to run. Catch you later!',         '가봐야 해. 나중에 봐!',             10)
on conflict do nothing;

-- Cards: 기초 일본어 단어 -----------------------------------
insert into public.cards (deck_id, term, reading, meaning, example, example_meaning, sort_order) values
  ('33333333-3333-3333-3333-333333333333', '水',     'みず (mizu)',          '물',      '水をください。',         '물 주세요.',          1),
  ('33333333-3333-3333-3333-333333333333', '友達',   'ともだち (tomodachi)', '친구',    '彼は私の友達です。',     '그는 제 친구예요.',    2),
  ('33333333-3333-3333-3333-333333333333', '本',     'ほん (hon)',           '책',      '本を読みます。',         '책을 읽어요.',        3),
  ('33333333-3333-3333-3333-333333333333', '家',     'いえ (ie)',            '집',      '家に帰ります。',         '집에 돌아가요.',      4),
  ('33333333-3333-3333-3333-333333333333', '学校',   'がっこう (gakkou)',    '학교',    '学校へ行きます。',       '학교에 가요.',        5),
  ('33333333-3333-3333-3333-333333333333', '食べる', 'たべる (taberu)',      '먹다',    'ご飯を食べる。',         '밥을 먹다.',          6),
  ('33333333-3333-3333-3333-333333333333', '時間',   'じかん (jikan)',       '시간',    '時間がありません。',     '시간이 없어요.',      7),
  ('33333333-3333-3333-3333-333333333333', 'お金',   'おかね (okane)',       '돈',      'お金が必要です。',       '돈이 필요해요.',      8),
  ('33333333-3333-3333-3333-333333333333', '好き',   'すき (suki)',          '좋아함',  '猫が好きです。',         '고양이를 좋아해요.',  9),
  ('33333333-3333-3333-3333-333333333333', '勉強',   'べんきょう (benkyou)', '공부',    '日本語を勉強します。',   '일본어를 공부해요.',  10),
  ('33333333-3333-3333-3333-333333333333', '旅行',   'りょこう (ryokou)',    '여행',    '旅行が好きです。',       '여행을 좋아해요.',    11),
  ('33333333-3333-3333-3333-333333333333', '美しい', 'うつくしい (utsukushii)', '아름다운', '美しい景色ですね。',  '아름다운 경치네요.',  12)
on conflict do nothing;

-- Sentences: ko → en ----------------------------------------
insert into public.sentences (source_lang, target_lang, level, text_target, reading, text_source, day_index) values
  ('ko', 'en', 'beginner', 'Where is the nearest station?',       null, '가장 가까운 역이 어디예요?',        1),
  ('ko', 'en', 'beginner', 'Could you say that again, please?',   null, '다시 한 번 말씀해 주시겠어요?',     2),
  ('ko', 'en', 'beginner', 'I''d like to order a coffee.',        null, '커피 한 잔 주문할게요.',           3),
  ('ko', 'en', 'beginner', 'How much does this cost?',            null, '이거 얼마예요?',                   4),
  ('ko', 'en', 'beginner', 'I''m looking forward to it.',         null, '그것이 기대돼요.',                 5),
  ('ko', 'en', 'beginner', 'Can you help me with this?',          null, '이것 좀 도와주시겠어요?',          6),
  ('ko', 'en', 'beginner', 'I think you''re right.',              null, '당신 말이 맞는 것 같아요.',         7),
  ('ko', 'en', 'beginner', 'Let''s keep in touch.',               null, '계속 연락해요.',                   8),
  ('ko', 'en', 'beginner', 'It was nice meeting you.',            null, '만나서 반가웠어요.',               9),
  ('ko', 'en', 'beginner', 'I''m not sure about that.',           null, '그건 잘 모르겠어요.',              10),
  ('ko', 'en', 'beginner', 'Could I get the bill, please?',       null, '계산서 좀 주시겠어요?',            11),
  ('ko', 'en', 'beginner', 'Have a great day!',                   null, '좋은 하루 보내세요!',              12)
on conflict do nothing;

-- Sentences: ko → ja ----------------------------------------
insert into public.sentences (source_lang, target_lang, level, text_target, reading, text_source, day_index) values
  ('ko', 'ja', 'beginner', '駅はどこですか。',         'えきはどこですか (eki wa doko desu ka)',          '역은 어디예요?',          1),
  ('ko', 'ja', 'beginner', 'もう一度言ってください。', 'もういちどいってください (mou ichido itte kudasai)', '다시 한 번 말해 주세요.', 2),
  ('ko', 'ja', 'beginner', 'コーヒーを一杯ください。', 'コーヒーをいっぱいください (koohii o ippai kudasai)', '커피 한 잔 주세요.',     3),
  ('ko', 'ja', 'beginner', 'これはいくらですか。',     'これはいくらですか (kore wa ikura desu ka)',       '이거 얼마예요?',          4),
  ('ko', 'ja', 'beginner', '楽しみにしています。',     'たのしみにしています (tanoshimi ni shiteimasu)',   '기대하고 있어요.',        5),
  ('ko', 'ja', 'beginner', '手伝ってもらえますか。',   'てつだってもらえますか (tetsudatte moraemasu ka)', '도와주시겠어요?',         6),
  ('ko', 'ja', 'beginner', 'また連絡しましょう。',     'またれんらくしましょう (mata renraku shimashou)',  '또 연락해요.',            7),
  ('ko', 'ja', 'beginner', '良い一日を！',             'よいいちにちを (yoi ichinichi o)',                 '좋은 하루 보내세요!',     8)
on conflict do nothing;
