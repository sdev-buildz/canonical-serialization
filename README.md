<header>
  <h1 align="center">
    Canonical Serialization
  </h1 align="center">
</header>

## 🚀 Features

- Serializes objects into unique, deterministic, and deserializable strings, even with circular references.
- Compares objects using deep structural equality.
- Sorts object keys recursively to guarantee consistent output despite key reordering.
- Uses [serialize-javascript](https://www.npmjs.com/package/serialize-javascript) to handle Dates, RegExps, and functions.

## 📦 Installation

```sh
npm install canonical-serialization
```

## 💻 Usage Examples

### 🗂️ Sorts keys recursively. Serializes Dates, RegExps and functions.

```ts
import { canonicalSerialization } from 'canonical-serialization'

// keys of this object are unsorted
const obj1 = {
  b: 2,
  d: {
    // inside nested object
    g: () => {
      return 'lorem ipsum'
    },
    a: new Date(),
  },
  c: 1,
}

console.log(
  canonicalSerialization(obj1, { keepCircularReferences: false }, { space: 2 })
)
// Outputs:
// ({
//  "b": 2,
//  "c": 1,
//  "d": {
//    "a": new Date("2026-07-30T18:01:32.236Z"),
//    "g": ()=>{return"lorem ipsum"}
//  }
// })
// keys are sorted recursively. Dates are also serialized.
```

### 🔄 Serializes shared references (circular or non-circular references) by default. <a id="circular-references"></a>

```ts
const obj1 = { a: { c: {} as Record<string, unknown>, b: 2 } }
obj1.a.c = obj1

console.log(canonicalSerialization(obj1))
//  Outputs: ({"__csNodeId__":0,"value":{"a":{"__csNodeId__":1,"value":{"b":2,"c":{"__csNodeRef__":0}}}}})

//  You can disable serialization of shared references for more readable output.
console.log(canonicalSerialization(obj1), { keepCircularReferences: false })
//  Outputs: ({"a":{"b":2,"c":undefined}})
```

### 🔎 Deep structural equality comparison.

```ts
import { areStructurallyEqual } from "canonical-serialization";

const obj1 = {
 b: 2,
 a: {
   c: 1,
 },
 d: {
   g: "lorem ipsum",
   q: {
     m: "m",
     p: "p",
     n: "n",
     a: 5 as number | Record<string, unknown>,
   },
   a: 2 as number | Record<string, unknown>,
  },
};
obj1.d.a = obj1.a;  // adding circular references
obj1.d.q.a = obj1.d;

// This obj2 is structurally the same as obj1.
// But obj1 and obj2 do not share the same reference.
// The order of keys is also different.
const obj2 = structuralClone(obj1) as Partial<typeof obj1>;
obj2.delete a
// obj2.a is moved to last to change the order of keys.
obj2.a = structuralClone(obj1.a)

console.log(Object.is(obj1, obj2)) // Outputs: false

try {
 // Throws because of circular reference
 console.log(JSON.stringify(obj1) === JSON.stringify(obj2))
} catch (err) {
  console.error(err)
}

// Outputs: true
console.log(areStructurallyEqual(obj1,obj2))
```

### ↩ Deserialization

Use `deserialize` to deserialize.

```ts
import { deserialize } from 'canonical-serialization'

const deserializedObject = deserialize(serializedString)
```

If [shared references](#circular-references) were not serialized,
[eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) also can deserialize.

## 👥 Community & Support

- 💬 _**Have an idea?**_ Suggest new features in [GitHub Discussions](https://github.com/ken-devz/canonical-serialization/discussions).

- 🚀 _**Support me or my projects**_ through [donations](https://buymeacoffee.com/stevenx.dev).

- 💼 _**Need custom work or consultation?**_ I am available for hire! Reach out via [email](<(mailto:stevexdev+234@zohomail.in)>).
