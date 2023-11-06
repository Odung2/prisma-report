const express = require('express');
const { PrismaClient } = require('@prisma/client'); // PrismaClient를 불러옵니다.

const app = express();
const prisma = new PrismaClient(); // Prisma 클라이언트 인스턴스를 생성합니다.
const port = 3000;
app.use(express.json());

// BigInt.function.toJSON = function() {return this.toString}
// async function getCustomersWithIncomeRangeRaw() {
//   const rawQuery = `
//     SELECT firstName, lastName, income
//     FROM Customer
//     WHERE income BETWEEN 50000 AND 60000
//     ORDER BY income DESC, lastName ASC, firstName ASC
//     LIMIT 10;
//   `;

//   const customers = await prisma.$queryRaw(rawQuery); // Prisma 인스턴스를 사용하여 쿼리를 실행합니다.
  
//   return customers;
// }
async function problems1() {
  // Tagged template literal을 사용하여 쿼리를 정의합니다. 보안 이슈
  const customers = await prisma.$queryRaw`
    SELECT firstName, lastName, income
    FROM Customer
    WHERE income BETWEEN 50000 AND 60000
    ORDER BY income DESC, lastName ASC, firstName ASC
    LIMIT 10;
  `;
  
  return customers;
}

async function problems2() {
  // Tagged template literal을 사용하여 쿼리를 정의합니다. 보안 이슈
  const customers = await prisma.$queryRaw`
    SELECT 
      e.sin, 
      b.branchName, 
      e.salary, 
      (m.salary - e.salary) AS difference
    FROM Employee e
    INNER JOIN Branch b ON e.branchNumber = b.branchNumber
    INNER JOIN Employee m ON b.managerSIN = m.sin
    WHERE b.branchName IN ('London', 'Berlin')
    ORDER BY difference DESC
    LIMIT 10;
  `;
  
  return customers;
}
async function problems3() {
  // Tagged template literal을 사용하여 쿼리를 정의합니다. 보안 이슈
  const customers = await prisma.$queryRaw`
  SELECT 
  c.firstName, 
  c.lastName, 
  c.income
FROM Customer c
WHERE c.income >= ALL (
  SELECT 2 * c2.income
  FROM Customer c2
  WHERE c2.lastName = 'Butler'
)
ORDER BY c.lastName ASC, c.firstName ASC
LIMIT 10;
  `;
  
  return customers;
}

async function problems4() {
  // Tagged template literal을 사용하여 쿼리를 정의합니다. 보안 이슈
  const customers = await prisma.$queryRaw`
  SELECT DISTINCT
        c.customerID,
        c.income,
        a.accNumber,
        a.branchNumber
    FROM Customer c
    JOIN Owns o ON c.customerID = o.customerID
    JOIN Account a ON o.accNumber = a.accNumber
    WHERE c.income > 80000
    AND EXISTS (
        SELECT 1 FROM Owns o1
        JOIN Account a1 ON o1.accNumber = a1.accNumber
        JOIN Branch b1 ON a1.branchNumber = b1.branchNumber
        WHERE o1.customerID = c.customerID AND b1.branchName = 'London'
    )
    AND EXISTS (
        SELECT 1 FROM Owns o2
        JOIN Account a2 ON o2.accNumber = a2.accNumber
        JOIN Branch b2 ON a2.branchNumber = b2.branchNumber
        WHERE o2.customerID = c.customerID AND b2.branchName = 'Latveria'
    )
    ORDER BY c.customerID ASC, a.accNumber ASC
    LIMIT 10;
  `;
  
  return customers;
}

async function problems5() {
  // Tagged template literal을 사용하여 쿼리를 정의합니다. 보안 이슈
  const customers = await prisma.$queryRaw`
  SELECT 
        o.customerID, 
        a.type, 
        a.accNumber, 
        a.balance
    FROM Owns o
    JOIN Account a ON o.accNumber = a.accNumber
    WHERE a.type IN ('BUS', 'SAV')
    AND o.customerID IN (
        SELECT DISTINCT o1.customerID
        FROM Owns o1
        JOIN Account a1 ON o1.accNumber = a1.accNumber
        WHERE a1.type IN ('BUS', 'SAV')
    )
    ORDER BY o.customerID ASC, a.type ASC, a.accNumber ASC
    LIMIT 10;
  `;
  
  return customers;
}

async function problems6() {
  const result = await prisma.$queryRaw`
  SELECT 
    b.branchName, 
    a.accNumber, 
    a.balance
FROM Account a
JOIN Branch b ON a.branchNumber = b.branchNumber
JOIN Employee e ON b.managerSIN = e.sin
WHERE a.balance > 100000 
AND e.firstName = 'Phillip' 
AND e.lastName = 'Edwards'
ORDER BY a.accNumber ASC
LIMIT 10;
  `;
  return result;
}

async function problems7() {
  const result = await prisma.$queryRaw`
  SELECT DISTINCT c.customerID
  FROM Customer c
  JOIN Owns o ON c.customerID = o.customerID
  JOIN Account a ON o.accNumber = a.accNumber
  JOIN Branch b ON a.branchNumber = b.branchNumber
  WHERE b.branchName = 'New York'
  AND NOT EXISTS (
      -- Customers that own an account at the London branch
      SELECT 1
      FROM Owns o2
      JOIN Account a2 ON o2.accNumber = a2.accNumber
      JOIN Branch b2 ON a2.branchNumber = b2.branchNumber
      WHERE b2.branchName = 'London' AND o2.customerID = c.customerID
  )
  AND NOT EXISTS (
      -- Customers that co-own an account with another customer who owns an account at the London branch
      SELECT 1
      FROM Owns o3
      JOIN Owns o4 ON o3.accNumber = o4.accNumber AND o3.customerID != o4.customerID
      JOIN Account a3 ON o4.accNumber = a3.accNumber
      JOIN Branch b3 ON a3.branchNumber = b3.branchNumber
      WHERE b3.branchName = 'London' AND o3.customerID = c.customerID
  )
  ORDER BY c.customerID ASC
  LIMIT 10; 
  `;
  return result;
}

async function problems8() {
  const result = await prisma.$queryRaw`
  SELECT 
    e.sin, 
    e.firstName, 
    e.lastName, 
    e.salary, 
    b.branchName
FROM Employee e
LEFT JOIN Branch b ON e.sin = b.managerSIN AND e.salary > 50000
WHERE e.salary > 50000
ORDER BY b.branchName DESC, e.firstName ASC
LIMIT 10;
  `;
  return result;
}

async function problems9() {
  const result = await prisma.$queryRaw`
  SELECT 
    e.sin, 
    e.firstName, 
    e.lastName, 
    e.salary,
    CASE
        WHEN e.sin = b.managerSIN THEN b.branchName
        ELSE NULL
    END AS branchName
FROM Employee e, Branch b
WHERE e.salary > 50000
ORDER BY branchName DESC, e.firstName ASC
LIMIT 10;
  `;
  return result;
}

async function problems10() {
  const result = await prisma.$queryRaw`
  SELECT DISTINCT c.customerID, c.firstName, c.lastName, c.income
FROM Customer c
JOIN Owns o ON c.customerID = o.customerID
JOIN Account a ON o.accNumber = a.accNumber
JOIN Branch b ON a.branchNumber = b.branchNumber
WHERE c.income > 5000
AND NOT EXISTS (
  -- Select branches where Helen Morgan has accounts
  SELECT b1.branchNumber
  FROM Customer c1
  JOIN Owns o1 ON c1.customerID = o1.customerID
  JOIN Account a1 ON o1.accNumber = a1.accNumber
  JOIN Branch b1 ON a1.branchNumber = b1.branchNumber
  WHERE c1.firstName = 'Helen' AND c1.lastName = 'Morgan'
  AND NOT EXISTS (
    -- Check that the current customer also has accounts in these branches
    SELECT *
    FROM Owns o2
    JOIN Account a2 ON o2.accNumber = a2.accNumber
    WHERE o2.customerID = c.customerID AND a2.branchNumber = b1.branchNumber
  )
)
ORDER BY c.income DESC;
  `;
  return result;
}

async function problems11() {
  const result = await prisma.$queryRaw`
  SELECT e.SIN, e.firstName, e.lastName, e.salary
FROM Employee e
JOIN Branch b ON e.branchNumber = b.branchNumber
WHERE b.branchName = 'Berlin' AND e.salary = (
  SELECT MIN(e2.salary)
  FROM Employee e2
  JOIN Branch b2 ON e2.branchNumber = b2.branchNumber
  WHERE b2.branchName = 'Berlin'
)
ORDER BY e.SIN ASC
LIMIT 10;
  `;
  return result;
}

async function problems12() {
  const result = await prisma.$queryRaw`
  SELECT b.branchName,
       MAX(e.salary) - MIN(e.salary) AS salary_gap,
       AVG(e.salary) AS average_salary
FROM Branch b
JOIN Employee e ON b.branchNumber = e.branchNumber
GROUP BY b.branchName
ORDER BY b.branchName ASC
LIMIT 10;
  `;
  return result;
}

async function problems13() {
  const result = await prisma.$queryRaw`
  SELECT 
    COUNT(*) AS countNY,
    COUNT(DISTINCT e.lastName) AS countDIFF
FROM Employee e
JOIN Branch b ON e.branchNumber = b.branchNumber
WHERE b.branchName = 'New York';
  `;
  return result;
}

async function problems14() {
  const result = await prisma.$queryRaw`
  SELECT SUM(e.salary) AS total_salaries
FROM Employee e
JOIN Branch b ON e.branchNumber = b.branchNumber
WHERE b.branchName = 'Moscow';
  `;
  return result;
}

async function problems15() {
  const result = await prisma.$queryRaw`
  SELECT c.customerID, c.firstName, c.lastName
FROM Customer c
JOIN Owns o ON c.customerID = o.customerID
JOIN Account a ON o.accNumber = a.accNumber
JOIN Branch b ON a.branchNumber = b.branchNumber
GROUP BY c.customerID, c.firstName, c.lastName
HAVING COUNT(DISTINCT b.branchName) = 4
ORDER BY c.lastName ASC, c.firstName ASC
LIMIT 10;
  `;
  return result;
}

async function problems16() {
  const result = await prisma.$queryRaw`
  SELECT 
    AVG(CASE WHEN TIMESTAMPDIFF(YEAR, c.birthData, CURDATE()) > 60 THEN c.income END) AS avg_income_over_60,
    AVG(CASE WHEN TIMESTAMPDIFF(YEAR, c.birthData, CURDATE()) < 26 THEN c.income END) AS avg_income_under_26
FROM Customer c;
  `;
  return result;
}

async function problems17() {
  const result = await prisma.$queryRaw`
  SELECT c.customerID, c.firstName, c.lastName, c.income, AVG(a.balance) AS average_balance
FROM Customer c
JOIN Owns o ON c.customerID = o.customerID
JOIN Account a ON o.accNumber = a.accNumber
WHERE c.lastName LIKE 'S%e%'
GROUP BY c.customerID, c.firstName, c.lastName, c.income
HAVING COUNT(a.accNumber) >= 3
ORDER BY c.customerID ASC
LIMIT 10;
  `;
  return result;
}

async function problems18() {
  const result = await prisma.$queryRaw`
  SELECT a.accNumber, a.balance, SUM(t.amount) AS transaction_sum
FROM Account a
JOIN Transactions t ON a.accNumber = t.accNumber
JOIN Branch b ON a.branchNumber = b.branchNumber
WHERE b.branchName = 'Berlin'
GROUP BY a.accNumber, a.balance
HAVING COUNT(t.transNumber) >= 10
ORDER BY transaction_sum ASC
LIMIT 10;
  `;
  return result;
}

async function problems19() {
  const result = await prisma.$queryRaw`
  SELECT b.branchName, a.type, AVG(t.amount) AS avg_transaction_amount
FROM Branch b
JOIN Account a ON b.branchNumber = a.branchNumber
JOIN Transactions t ON a.accNumber = t.accNumber
GROUP BY b.branchName, a.type
HAVING COUNT(a.accNumber) >= 50
ORDER BY b.branchName ASC, a.type ASC
LIMIT 10;
  `;
  return result;
}

async function problems20() {
  const result = await prisma.$queryRaw`
  SELECT a.type, a.accNumber, t.transNumber, t.amount
FROM Account a
JOIN Transactions t ON a.accNumber = t.accNumber
GROUP BY a.type, a.accNumber, t.transNumber, t.amount
HAVING AVG(t.amount) > 3 * (
  SELECT AVG(t2.amount)
  FROM Transactions t2
  JOIN Account a2 ON t2.accNumber = a2.accNumber
  WHERE a2.type = a.type
)
ORDER BY a.type ASC, a.accNumber ASC, t.transNumber ASC
LIMIT 10;
  `;
  return result;
}

// async function registerEmployee(employeeData) {
//   // employeeData should include all the necessary fields required to create a new employee record
//   const newEmployee = await prisma.employee.create({
//     data: employeeData
//   });
//   return newEmployee;
// }


// 문제 1에 해당하는 엔드포인트
app.get('/problems/1', async (req, res) => {
  try {
    const customers = await problems1();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/problems/2', async (req, res) => {
  try {
    let results = await problems2();
    // Convert all BigInt values to strings
    results = results.map(result => {
      const modifiedResult = { ...result };
      for (const key in modifiedResult) {
        if (typeof modifiedResult[key] === 'bigint') {
          modifiedResult[key] = modifiedResult[key].toString();
        }
      }
      return modifiedResult;
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/problems/3', async (req, res) => {
  try {
    const customers = await problems3();
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/problems/4', async (req, res) => {
  try {
    const result = await problems4();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/problems/5', async (req, res) => {
  try {
    const result = await problems5();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/6 엔드포인트
app.get('/problems/6', async (req, res) => {
  try {
    const result = await problems6(); // problems6 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/7 엔드포인트
app.get('/problems/7', async (req, res) => {
  try {
    const result = await problems7(); // problems7 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/8 엔드포인트
app.get('/problems/8', async (req, res) => {
  try {
    const result = await problems8(); // problems8 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/9 엔드포인트
app.get('/problems/9', async (req, res) => {
  try {
    const result = await problems9(); // problems9 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/10 엔드포인트
app.get('/problems/10', async (req, res) => {
  try {
    const result = await problems10(); // problems10 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// problems/11 엔드포인트
app.get('/problems/11', async (req, res) => {
  try {
    const result = await problems11(); // problems11 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/12 엔드포인트
app.get('/problems/12', async (req, res) => {
  try {
    let results = await problems12();
    // Convert all BigInt values to strings
    results = results.map(result => {
      const modifiedResult = { ...result };
      for (const key in modifiedResult) {
        if (typeof modifiedResult[key] === 'bigint') {
          modifiedResult[key] = modifiedResult[key].toString();
        }
      }
      return modifiedResult;
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/13 엔드포인트
app.get('/problems/13', async (req, res) => {
  try {
    let results = await problems13();
    // Convert all BigInt values to strings
    results = results.map(result => {
      const modifiedResult = { ...result };
      for (const key in modifiedResult) {
        if (typeof modifiedResult[key] === 'bigint') {
          modifiedResult[key] = modifiedResult[key].toString();
        }
      }
      return modifiedResult;
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/14 엔드포인트
app.get('/problems/14', async (req, res) => {
  try {
    const result = await problems14(); // problems14 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/15 엔드포인트
app.get('/problems/15', async (req, res) => {
  try {
    const result = await problems15(); // problems15 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/16 엔드포인트
app.get('/problems/16', async (req, res) => {
  try {
    const result = await problems16(); // problems16 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/17 엔드포인트
app.get('/problems/17', async (req, res) => {
  try {
    const result = await problems17(); // problems17 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/18 엔드포인트
app.get('/problems/18', async (req, res) => {
  try {
    const result = await problems18(); // problems18 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// problems/19 엔드포인트
app.get('/problems/19', async (req, res) => {
  try {
    const result = await problems19(); // problems19 함수는 해당 엔드포인트의 로직을 처리합니다.
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get('/problems/20', async (req, res) => {
  try {
    const result = await problems20();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /employee/join 엔드포인트에 대한 핸들러
app.post('/employee/join', async (req, res) => {
  // 요청 본문에서 직원 데이터 추출
  const { sin, firstName, lastName, salary, branchNumber } = req.body;

  // 입력 값 검증
  if (!sin || !firstName || !lastName || !salary || !branchNumber) {
    return res.status(400).send({ message: "모든 필드를 제공해야 합니다." });
  }

  try {
    // Prisma ORM을 사용하여 Employee 테이블에 새로운 레코드 추가
    const newEmployee = await prisma.employee.create({
      data: {
        sin: sin,
        firstName: firstName,
        lastName: lastName,
        salary: salary,
        branchNumber: branchNumber
      }
    });

    // 성공 메시지와 함께 새로운 직원 데이터 반환
    res.status(201).send({
      message: '이 팀은 미친듯이 일하는 일꾼들로 이루어진 광전사 설탕 노움 조합이다. 분위기에 적응하기는 쉽지 않지만 아주 화력이 좋은 강력한 조합인거 같다.',
      employee: newEmployee
    });
  } catch (error) {
    // 에러 처리
    res.status(500).send({ message: "직원 등록 중 오류가 발생했습니다.", error: error.message });
  }
});

app.post('/employee/leave', async (req, res) => {
  const { sin } = req.body; // `sin`을 통해 employee를 식별

  try {
    // Employee 레코드를 삭제하여 hard-delete 실행
    const deleteEmployee = await prisma.employee.delete({
      where: { sin },
    });

    // 성공적으로 삭제되면 메시지 반환
    res.send('**안녕히 계세요 여러분!\n전 이 세상의 모든 굴레와 속박을 벗어 던지고 제 행복을 찾아 떠납니다!\n여러분도 행복하세요~~!**');
  } catch (error) {
    // 오류 발생 시 처리
    if (error.code === 'P2025') {
      // 삭제하려는 레코드가 없을 경우
      res.status(404).send('Employee not found.');
    } else {
      // 다른 종류의 오류 발생 시
      console.error('Error during employee leave:', error);
      res.status(500).send('An error occurred while processing your request.');
    }
  }
});

// app.post('/account/:account_no/deposit', async (req, res) => {
//   const accountNo = parseInt(req.params.account_no, 10); // URL 파라미터에서 계좌 번호를 가져옴
//   const { customerId, amount } = req.body; // 요청 본문에서 고객 ID와 입금액을 가져옴

//   try {
//     // 계좌의 소유자 확인
//     const owns = await prisma.owns.findUnique({
//       where: {
//         customerID_accNumber: {
//           customerID: customerId,
//           accNumber: accountNo
//         }
//       },
//     });

//     // 계좌가 존재하지 않거나, 요청한 고객 ID가 계좌 소유자의 ID와 일치하지 않는 경우
//     if (!owns.accNumber || owns.customerID !== customerId) {
//       return res.status(403).json({ message: 'Access denied or account not found.' });
//     }

//     // 입금 처리: 계좌 잔액을 업데이트
//     const updatedAccount = await prisma.account.update({
//       where: { accNumber: accountNo },
//       data: { balance: (parseFloat(prisma.account.balance) + parseFloat(amount)).toString },
//     });

//     // 업데이트된 잔액 반환
//     res.json({ newBalance: updatedAccount.balance });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

app.post('/account/:account_no/deposit', async (req, res) => {
  const accountNo = parseInt(req.params.account_no, 10); // URL 파라미터에서 계좌 번호를 가져옴
  const { customerId, amount } = req.body; // 요청 본문에서 고객 ID와 입금액을 가져옴

  try {
    // 계좌의 소유자 확인
    const owns = await prisma.owns.findUnique({
      where: {
        customerID_accNumber: {
          customerID: customerId,
          accNumber: accountNo
        }
      },
    });

    // 계좌가 존재하지 않거나, 요청한 고객 ID가 계좌 소유자의 ID와 일치하지 않는 경우
    if (!owns || owns.customerID !== customerId) {
      return res.status(403).json({ message: 'Access denied or account not found.' });
    }

    // 계좌의 현재 잔액 조회
    const account = await prisma.account.findUnique({
      where: { accNumber: accountNo },
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found.' });
    }

    // 입금 처리: 계좌 잔액을 업데이트
    const newBalance = (parseFloat(account.balance) + parseFloat(amount)).toString();
    const updatedAccount = await prisma.account.update({
      where: { accNumber: accountNo },
      data: { balance: newBalance },
    });

    // 업데이트된 잔액 반환
    res.json({ newBalance: updatedAccount.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.post('/account/:account_no/withdraw', async (req, res) => {
  const accountNo = parseInt(req.params.account_no, 10); // URL 파라미터에서 계좌 번호를 가져옴
  const { customerId, amount } = req.body; // 요청 본문에서 고객 ID와 출금액을 가져옴

  try {
    // 계좌 정보 확인
    const owns = await prisma.owns.findUnique({
      where: {
        customerID_accNumber: {
          customerID: customerId,
          accNumber: accountNo
        }
      },
    });
    

    // 계좌가 존재하지 않거나, 요청한 고객 ID가 계좌 소유자의 ID와 일치하지 않는 경우
    if (!owns || owns.customerID !== customerId) {
      return res.status(403).json({ message: 'Access denied or account not found.' });
    }

    // 계좌의 현재 잔액 조회
    const account = await prisma.account.findUnique({
      where: { accNumber: accountNo },
    });

    // 출금 후 잔액이 0원 미만이 되는 경우
    if (account.balance - amount < 0) {
      return res.status(400).json({ message: 'Insufficient funds for this withdrawal.' });
    }

    // 출금 처리: 계좌 잔액을 업데이트
    const newBalance = (parseFloat(account.balance) - parseFloat(amount)).toString();
    const updatedAccount = await prisma.account.update({
      where: { accNumber: accountNo },
      data: { balance: newBalance },
    });

    // 업데이트된 잔액 반환
    res.json({ newBalance: updatedAccount.balance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});