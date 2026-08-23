ALTER TABLE growth_logs ADD COLUMN IF NOT EXISTS activity_type varchar(30) NOT NULL DEFAULT 'observation';
ALTER TABLE growth_logs ADD COLUMN IF NOT EXISTS points_awarded integer NOT NULL DEFAULT 0 CHECK(points_awarded >= 0);

CREATE TABLE IF NOT EXISTS point_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount integer NOT NULL, reason varchar(120) NOT NULL, growth_log_id uuid REFERENCES growth_logs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS point_transactions_user_idx ON point_transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS point_shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name varchar(120) NOT NULL UNIQUE, description text NOT NULL,
  category varchar(30) NOT NULL, points_price integer NOT NULL CHECK(points_price > 0), stock integer NOT NULL DEFAULT 100 CHECK(stock >= 0),
  emoji varchar(10) NOT NULL DEFAULT '🌱', active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS point_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES point_shop_items(id), points_spent integer NOT NULL CHECK(points_spent > 0),
  status varchar(20) NOT NULL DEFAULT 'completed', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS point_redemptions_user_idx ON point_redemptions(user_id, created_at DESC);

INSERT INTO point_shop_items(name,description,category,points_price,stock,emoji) VALUES
('통기 배양토 1L','초보자도 과습 걱정을 줄이는 소포장 배양토','배양토',800,100,'🌱'),
('식물 활력 앰플 2개','새잎과 뿌리 활착을 돕는 관엽식물용 앰플','영양제',600,100,'💚'),
('파인 미스트 분무기','부드러운 안개 분사로 잎 주변 습도를 관리해요','관리용품',1200,50,'💧'),
('나만의 식물 이름표','반려식물 이름을 적는 우드 이름표','소품',400,200,'🏷️'),
('토양 수분 체크 스틱','흙 속 마름 상태를 색으로 확인해요','관리용품',1500,50,'🪄')
ON CONFLICT(name) DO NOTHING;
