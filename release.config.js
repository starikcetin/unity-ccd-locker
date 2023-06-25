module.exports = {
    branches: [
        "master"
    ],
    debug: true,
    plugins: [
        [
            "@semantic-release/commit-analyzer",
            {
                preset: 'conventionalCommits',
                releaseRules: [
                    { type: "docs", release: "patch" },
                    { type: "perf", release: "patch" },
                    { type: "docs", breaking: true, release: "major" },
                    { type: "perf", breaking: true, release: "major" },
                ],
            },
        ],
        [
            "@semantic-release/release-notes-generator",
            {
                preset: 'conventionalCommits',
                presetConfig: {
                    types: [
                        { type: "feat", section: "Features", hidden: false },
                        { type: "fix", section: "Bug Fixes", hidden: false },
                        { type: "perf", section: "Performance", hidden: false },
                        { type: "docs", section: "Documentation", hidden: false },
                    ],
                },
            },
        ],
        [
            "@semantic-release/changelog", 
            {
                changelogTitle: "# Unity CCD Locker Changelog",
            }
        ],
        "@semantic-release/npm",
        [
            // make sure github comes after npm, because we are building the binaries in the prepublishOnly script
            "@semantic-release/github",
            {
                "assets": "bin/*"
            }
        ],
        "@semantic-release/git",
    ],
}
