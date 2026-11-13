// scripts/seed-demo.mjs
// Recria a conta de demonstração e algumas transações através da home.
// Uso: $env:HOME_URL="https://<home>.vercel.app"; node scripts/seed-demo.mjs
const HOME = process.env.HOME_URL;
if (!HOME) throw new Error("HOME_URL não definida");

const EMAIL = process.env.DEMO_EMAIL ?? "demo@bytebank.test";
const PASSWORD = process.env.DEMO_PASSWORD ?? "demo123456";
const USERNAME = process.env.DEMO_USERNAME ?? "Demo";

let cookie = "";

async function call(path, init = {}) {
  const response = await fetch(`${HOME}${path}`, {
    ...init,
    headers: {
      Origin: HOME,
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
      ...(init.headers ?? {}),
    },
    redirect: "manual",
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) cookie = setCookie.split(";")[0];

  return response;
}

const register = await call("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({
    username: USERNAME,
    email: EMAIL,
    password: PASSWORD,
  }),
});
console.log("register", register.status); // 201 na primeira vez; 400 se já existe

const login = await call("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
console.log("login", login.status);
if (!login.ok) process.exit(1);

const overviewResponse = await call("/api/account");
const overview = await overviewResponse.json();
console.log("account", overviewResponse.status, overview.account?.id);
if (!overview.account?.id) process.exit(1);

const samples = [
  { type: "Credit", value: 2500, from: "Salário" },
  { type: "Debit", value: 120.9, to: "Mercado" },
  { type: "Debit", value: 45.5, to: "Transporte" },
  { type: "Debit", value: 89.9, to: "Internet" },
  { type: "Credit", value: 300, from: "Freelance" },
  { type: "Debit", value: 210.4, to: "Farmácia" },
];

for (const [index, sample] of samples.entries()) {
  const response = await call("/api/transactions", {
    method: "POST",
    body: JSON.stringify(sample),
  });
  console.log(`transaction ${index + 1}`, response.status);
  if (!response.ok) process.exit(1);
}

console.log("seed ok");
