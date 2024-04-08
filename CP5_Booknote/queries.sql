CREATE TABLE users (
id SERIAL PRIMARY KEY,
username VARCHAR(25) NOT NULL,
password VARCHAR(25) NOT NULL
);

CREATE TABLE booknotes (
id SERIAL PRIMARY KEY,
	user_id INTEGER REFERENCES users(id),
	title TEXT,
	author VARCHAR(50),
	isbn CHAR(13) NOT NULL,
	post_date DATE,
	rating INTEGER CHECK(rating >= 0 And rating <=10),
	booknote TEXT,
	cover BYTEA
);
ALTER TABLE booknotes
ADD UNIQUE (user_id, isbn);

