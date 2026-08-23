CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('customer', 'partner', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'preparing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE reward_type AS ENUM ('points', 'percent_coupon', 'free_shipping', 'fixed_coupon');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  display_name varchar(40) NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE, expires_at timestamptz NOT NULL, revoked_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens(user_id);

CREATE TABLE spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(80) NOT NULL, temperature_c numeric(4,1), humidity_percent numeric(5,2), light_lux integer,
  window_direction varchar(10), lifestyle jsonb NOT NULL DEFAULT '{}', image_url text,
  ai_analysis jsonb, analyzed_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX spaces_user_idx ON spaces(user_id);

CREATE TABLE plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), common_name varchar(100) NOT NULL, scientific_name varchar(150) UNIQUE,
  description text NOT NULL, image_url text, difficulty smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  min_temperature_c numeric(4,1), max_temperature_c numeric(4,1), min_humidity numeric(5,2), max_humidity numeric(5,2),
  min_light_lux integer, max_light_lux integer, watering_days_min smallint, watering_days_max smallint,
  pet_safe boolean NOT NULL DEFAULT false, sizes text[] NOT NULL DEFAULT '{}', price integer NOT NULL CHECK(price >= 0), active boolean NOT NULL DEFAULT true
);

CREATE TABLE recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  space_id uuid NOT NULL REFERENCES spaces(id) ON DELETE CASCADE, plant_id uuid NOT NULL REFERENCES plants(id),
  score numeric(5,2) NOT NULL CHECK(score BETWEEN 0 AND 100), reasons jsonb NOT NULL DEFAULT '[]', created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(space_id, plant_id)
);

CREATE TABLE partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid REFERENCES users(id), name varchar(120) NOT NULL,
  address text NOT NULL, latitude numeric(9,6), longitude numeric(9,6), active boolean NOT NULL DEFAULT true
);
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id), partner_id uuid REFERENCES partners(id),
  status order_status NOT NULL DEFAULT 'pending', subtotal integer NOT NULL CHECK(subtotal >= 0), discount integer NOT NULL DEFAULT 0 CHECK(discount >= 0),
  shipping_fee integer NOT NULL DEFAULT 0 CHECK(shipping_fee >= 0), total integer NOT NULL CHECK(total >= 0),
  shipping_address jsonb NOT NULL, payment_reference text, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON orders(user_id, created_at DESC);
CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  plant_id uuid REFERENCES plants(id), name text NOT NULL, quantity integer NOT NULL CHECK(quantity > 0), unit_price integer NOT NULL CHECK(unit_price >= 0), metadata jsonb NOT NULL DEFAULT '{}'
);

CREATE TABLE user_plants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plant_id uuid NOT NULL REFERENCES plants(id), order_item_id uuid REFERENCES order_items(id), nickname varchar(40) NOT NULL,
  adopted_at date NOT NULL DEFAULT CURRENT_DATE, status varchar(20) NOT NULL DEFAULT 'healthy', last_watered_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX user_plants_user_idx ON user_plants(user_id);
CREATE TABLE sensor_devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_plant_id uuid NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  serial_number text NOT NULL UNIQUE, api_key_hash text NOT NULL, last_seen_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sensor_readings (
  device_id uuid NOT NULL REFERENCES sensor_devices(id) ON DELETE CASCADE, recorded_at timestamptz NOT NULL,
  temperature_c numeric(4,1), humidity_percent numeric(5,2), light_lux integer, soil_moisture numeric(5,2),
  PRIMARY KEY(device_id, recorded_at)
);
CREATE INDEX sensor_readings_recent_idx ON sensor_readings(device_id, recorded_at DESC);

CREATE TABLE growth_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_plant_id uuid NOT NULL REFERENCES user_plants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE, note text, image_url text, height_cm numeric(6,2),
  ai_verification jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX growth_logs_plant_idx ON growth_logs(user_plant_id, created_at DESC);
CREATE TABLE quests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), code text NOT NULL UNIQUE, title varchar(100) NOT NULL, description text NOT NULL,
  trigger_type text NOT NULL, target_value integer NOT NULL, reward_type reward_type NOT NULL, reward_value integer NOT NULL,
  active boolean NOT NULL DEFAULT true, starts_at timestamptz, ends_at timestamptz
);
CREATE TABLE quest_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), quest_id uuid NOT NULL REFERENCES quests(id), user_id uuid NOT NULL REFERENCES users(id),
  user_plant_id uuid NOT NULL REFERENCES user_plants(id), growth_log_id uuid REFERENCES growth_logs(id), status verification_status NOT NULL DEFAULT 'pending',
  verified_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(quest_id, user_plant_id)
);
CREATE TABLE rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), completion_id uuid NOT NULL UNIQUE REFERENCES quest_completions(id), user_id uuid NOT NULL REFERENCES users(id),
  type reward_type NOT NULL, value integer NOT NULL, code text UNIQUE, used_at timestamptz, expires_at timestamptz, created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO quests(code,title,description,trigger_type,target_value,reward_type,reward_value) VALUES
('HEALTHY_7D','7일 동안 건강하게 키우기','입양 후 7일 동안 건강 상태를 유지하세요.','days_together',7,'points',500),
('FIRST_LEAF','첫 새잎 인증','새로 난 잎을 사진으로 인증하세요.','first_leaf',1,'percent_coupon',10),
('GROWTH_30D','30일 성장 사진 인증','입양 30일 후 성장 사진을 남겨주세요.','growth_photo_days',30,'free_shipping',1),
('TOGETHER_100D','100일 함께하기','반려식물과 100일을 함께하세요.','days_together',100,'percent_coupon',15)
ON CONFLICT(code) DO NOTHING;
