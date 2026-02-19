// Test 1: Standard case
console.log('--- Test 1: Standard case ---');
const title1 = "5 stars : Understood when questioned\n4 stars : Actively participated in speaking activity\n4 stars : Pronounced accurately\nNo comments";
let earned1 = 0;
let max1 = 0;

const starMatches1 = title1.matchAll(/(\d+) stars/g);
for (const m of starMatches1) {
    earned1 += parseInt(m[1]);
    max1 += 5;
}

console.log(`Title: ${JSON.stringify(title1)}`);
console.log(`Earned: ${earned1}`);
console.log(`Max: ${max1}`);
console.log(`Expected: Earned=13, Max=15`);

// Test 2: "No results" case 
console.log('\n--- Test 2: No results case ---');
const title2 = "No results recorded"; 
let earned2 = 0;
let max2 = 0;

const starMatches2 = title2.matchAll(/(\d+) stars/g);
for (const m of starMatches2) {
    earned2 += parseInt(m[1]);
    max2 += 5;
}

console.log(`Title: ${JSON.stringify(title2)}`);
console.log(`Earned: ${earned2}`);
console.log(`Max: ${max2}`);
console.log(`Expected: Earned=0, Max=0`);

// Test 3: Mixed content
console.log('\n--- Test 3: Mixed content ---');
const title3 = "3 stars : Good\nSome other text\n5 stars : Excellent";
let earned3 = 0;
let max3 = 0;

const starMatches3 = title3.matchAll(/(\d+) stars/g);
for (const m of starMatches3) {
    earned3 += parseInt(m[1]);
    max3 += 5;
}

console.log(`Title: ${JSON.stringify(title3)}`);
console.log(`Earned: ${earned3}`);
console.log(`Max: ${max3}`);
console.log(`Expected: Earned=8, Max=10`);
