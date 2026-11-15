import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";

const source = readFileSync("src/dev/flipGeometry.ts", "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } });
const { toBookPoint, turnMargin, releaseCompletes } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

// These are coordinate and release-contract tests. They do not stand in for
// browser gestures, pixel comparisons, listener audits or a timing benchmark.
let checks = 0;
for (const scale of [0.5, 0.72, 0.9, 1, 1.25, 1.6]) {
  for (const point of [{x:0,y:0},{x:620,y:330},{x:1228,y:648}]) {
    const rect = {left:137,top:88,width:1240*scale,height:660*scale};
    const actual = toBookPoint({x:rect.left+point.x*scale,y:rect.top+point.y*scale},rect);
    assert.ok(Math.abs(actual.x-point.x)<1e-8 && Math.abs(actual.y-point.y)<1e-8);
    checks++;
  }
}
assert.equal(turnMargin({x:0,y:330},0,4),null); checks++;
assert.equal(turnMargin({x:1240,y:330},2,4),null); checks++;
assert.equal(turnMargin({x:620,y:330},0,4),null); checks++;
assert.equal(turnMargin({x:1241,y:330},0,4),null); checks++;
assert.equal(turnMargin({x:1230,y:-1},0,4),null); checks++;
assert.equal(turnMargin({x:1200,y:10},0,4)?.corner,true); checks++;
assert.equal(turnMargin({x:1200,y:330},0,4),null); checks++;
assert.equal(turnMargin({x:1230,y:330},0,4)?.direction,1); checks++;
assert.equal(turnMargin({x:10,y:330},2,4)?.direction,-1); checks++;
for (const direction of [-1,1]) {
  const near = {x:direction>0?1100:140,y:100};
  const past = {x:direction>0?500:740,y:100};
  assert.equal(releaseCompletes(direction,near,0),false); checks++;
  assert.equal(releaseCompletes(direction,near,direction*2),false); checks++;
  assert.equal(releaseCompletes(direction,near,-direction*2),true); checks++;
  assert.equal(releaseCompletes(direction,past,0),true); checks++;
}

const protectedFiles = execFileSync("git", ["ls-tree", "-r", "--name-only", "stage3-approved", "src"], {encoding:"utf8"}).trim().split("\n");
for (const file of protectedFiles) {
  // Windows working-tree line endings differ from git blobs by design.
  const actual = readFileSync(file,"utf8").replaceAll("\r\n","\n");
  const expected = execFileSync("git",["show",`stage3-approved:${file}`],{encoding:"utf8"}).replaceAll("\r\n","\n");
  assert.ok(actual === expected,`${file} changed from the approved checkpoint`);
}
console.log(`PASS: ${checks} scale/margin/release cases; all ${protectedFiles.length} checkpoint source files identical after line-ending normalization.`);
console.log("Browser acceptance remains separate: no screenshots, gestures or performance results are implied by this check.");
