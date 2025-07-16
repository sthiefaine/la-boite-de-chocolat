import { normalizeGmailEmail, areGmailEquivalent } from "./helpers";

/**
 * Script de test pour la validation d'emails Gmail
 * À exécuter avec: npx tsx src/lib/test-email-validation.ts
 */

const testCases = [
  // Cas de base
  { input: "test@gmail.com", expected: "test@gmail.com" },
  { input: "TEST@gmail.com", expected: "test@gmail.com" },

  // Alias avec "+"
  { input: "test+alias@gmail.com", expected: "test@gmail.com" },
  { input: "test+123@gmail.com", expected: "test@gmail.com" },
  { input: "test+alias+other@gmail.com", expected: "test@gmail.com" },

  // Points dans l'email
  { input: "t.e.s.t@gmail.com", expected: "test@gmail.com" },
  { input: "test.user@gmail.com", expected: "testuser@gmail.com" },

  // Combinaison points + alias
  { input: "t.e.s.t+alias@gmail.com", expected: "test@gmail.com" },
  { input: "test.user+123@gmail.com", expected: "testuser@gmail.com" },

  // Autres domaines (pas de changement)
  { input: "test@outlook.com", expected: "test@outlook.com" },
  { input: "test+alias@outlook.com", expected: "test+alias@outlook.com" },
  { input: "test.user@outlook.com", expected: "test.user@outlook.com" },
];

const equivalenceTests = [
  { email1: "test@gmail.com", email2: "test+alias@gmail.com", expected: true },
  { email1: "test@gmail.com", email2: "t.e.s.t@gmail.com", expected: true },
  {
    email1: "test+123@gmail.com",
    email2: "test+456@gmail.com",
    expected: true,
  },
  { email1: "test@gmail.com", email2: "other@gmail.com", expected: false },
  {
    email1: "test@outlook.com",
    email2: "test+alias@outlook.com",
    expected: false,
  },
];

function runTests() {
  console.log("🧪 Test de normalisation d'emails Gmail\n");

  let passedTests = 0;
  let totalTests = testCases.length;

  testCases.forEach((testCase, index) => {
    const result = normalizeGmailEmail(testCase.input);
    const passed = result === testCase.expected;

    if (passed) {
      passedTests++;
      console.log(`✅ Test ${index + 1}: "${testCase.input}" → "${result}"`);
    } else {
      console.log(
        `❌ Test ${index + 1}: "${testCase.input}" → "${result}" (attendu: "${
          testCase.expected
        }")`
      );
    }
  });

  console.log(`\n📊 Résultats: ${passedTests}/${totalTests} tests réussis\n`);

  console.log("🔗 Test d'équivalence d'emails Gmail\n");

  let passedEquivalenceTests = 0;
  let totalEquivalenceTests = equivalenceTests.length;

  equivalenceTests.forEach((testCase, index) => {
    const result = areGmailEquivalent(testCase.email1, testCase.email2);
    const passed = result === testCase.expected;

    if (passed) {
      passedEquivalenceTests++;
      console.log(
        `✅ Test ${index + 1}: "${testCase.email1}" ≡ "${
          testCase.email2
        }" = ${result}`
      );
    } else {
      console.log(
        `❌ Test ${index + 1}: "${testCase.email1}" ≡ "${
          testCase.email2
        }" = ${result} (attendu: ${testCase.expected})`
      );
    }
  });

  console.log(
    `\n📊 Résultats équivalence: ${passedEquivalenceTests}/${totalEquivalenceTests} tests réussis\n`
  );

  const totalPassed = passedTests + passedEquivalenceTests;
  const totalTotal = totalTests + totalEquivalenceTests;

  console.log(`🎯 Total: ${totalPassed}/${totalTotal} tests réussis`);

  if (totalPassed === totalTotal) {
    console.log(
      "🎉 Tous les tests sont passés ! Le système de validation d'email fonctionne correctement."
    );
  } else {
    console.log(
      "⚠️  Certains tests ont échoué. Vérifiez la logique de normalisation."
    );
  }
}

// Exécuter les tests si le fichier est appelé directement
if (require.main === module) {
  runTests();
}

export { runTests };
