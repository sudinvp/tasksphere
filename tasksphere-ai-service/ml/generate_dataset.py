"""
Generates a synthetic-but-realistic labeled dataset of project management
tasks for training:
  1. A category classifier (Bug Fix, Feature Development, Documentation,
     Testing, Design, DevOps/Infrastructure, Research, Meeting/Admin,
     Maintenance, Security)
  2. A priority predictor (LOW, MEDIUM, HIGH, URGENT)

In a real deployment you'd replace this with your team's historical task
data (title, description, due_date, actual category/priority chosen by
humans). This generator uses templated phrasing + randomized urgency
signals + randomized due-date proximity so the resulting model learns
genuine textual + temporal patterns rather than memorizing exact strings.
"""

import random
import csv
from datetime import date, timedelta

random.seed(42)

CATEGORIES = {
    "Bug Fix": {
        "titles": [
            "Fix crash when {x} on {y}",
            "Resolve login failure for {x} users",
            "Patch memory leak in {y} service",
            "Fix incorrect {x} calculation in {y}",
            "Address null pointer exception in {y}",
            "Fix broken {x} button on {y} page",
            "Resolve data corruption in {y}",
            "Fix race condition in {y} module",
        ],
        "descs": [
            "Users report {x} fails intermittently after the latest deploy to {y}.",
            "Stack trace shows a {x} exception thrown from the {y} handler.",
            "Regression introduced by last sprint's changes to {y}; needs a hotfix.",
            "QA found this reproducible on {y} under {x} load.",
        ],
    },
    "Feature Development": {
        "titles": [
            "Implement {x} export for {y}",
            "Add {x} filtering to {y} dashboard",
            "Build new {y} onboarding flow",
            "Create {x} integration with {y}",
            "Add support for {x} in {y}",
            "Implement dark mode for {y}",
        ],
        "descs": [
            "Product wants {x} support added to the {y} module this quarter.",
            "New requirement from sales: {y} needs {x} capability.",
            "Design has finalized mockups for the {x} feature in {y}.",
            "Customer requested {x} functionality for {y}.",
        ],
    },
    "Documentation": {
        "titles": [
            "Write API docs for {y} endpoints",
            "Update README for {y} service",
            "Document {x} setup process",
            "Create onboarding guide for {y}",
            "Write architecture doc for {y}",
        ],
        "descs": [
            "New engineers need clearer docs on how {y} works.",
            "The {x} process isn't documented anywhere; write a guide.",
            "API consumers are confused about {y} usage, needs docs.",
        ],
    },
    "Testing": {
        "titles": [
            "Write unit tests for {y} module",
            "Add integration tests for {x} flow",
            "Increase test coverage on {y}",
            "Write E2E tests for {x} checkout",
            "Add regression tests for {y}",
        ],
        "descs": [
            "Coverage on {y} is below target; add tests before release.",
            "The {x} flow has no automated tests, causing repeat regressions.",
            "QA wants automated E2E coverage for {x} before launch.",
        ],
    },
    "Design": {
        "titles": [
            "Design UI mockups for {y}",
            "Create wireframes for {x} flow",
            "Redesign {y} settings page",
            "Design icon set for {y}",
        ],
        "descs": [
            "Need updated mockups for {y} before dev starts.",
            "Current {x} UI feels dated, redesign requested by stakeholders.",
            "Create a design spec for the new {y} experience.",
        ],
    },
    "DevOps/Infrastructure": {
        "titles": [
            "Set up CI/CD pipeline for {y}",
            "Migrate {y} to new cluster",
            "Configure autoscaling for {y}",
            "Set up monitoring for {y} service",
            "Provision new {x} environment",
        ],
        "descs": [
            "{y} deploys are manual and error-prone; automate with CI/CD.",
            "Need to migrate {y} off legacy infrastructure this quarter.",
            "Ops wants alerting configured for {y} before it handles more traffic.",
        ],
    },
    "Research": {
        "titles": [
            "Research {x} options for {y}",
            "Evaluate {x} libraries for {y}",
            "Investigate {x} performance issue in {y}",
            "Spike on {x} feasibility for {y}",
        ],
        "descs": [
            "Team needs a recommendation on {x} approach for {y}.",
            "Unclear why {y} is slow under {x}; needs investigation.",
            "Explore whether {x} is viable for the {y} rewrite.",
        ],
    },
    "Meeting/Admin": {
        "titles": [
            "Schedule sprint planning for {y}",
            "Prepare slides for {y} review",
            "Coordinate {x} kickoff meeting",
            "Set up retro for {y} team",
        ],
        "descs": [
            "Need to align stakeholders on {y} before next sprint.",
            "Prepare status update for {x} to share with leadership.",
            "Book time with {y} team to discuss {x} plan.",
        ],
    },
    "Maintenance": {
        "titles": [
            "Upgrade {y} dependencies",
            "Refactor legacy {y} code",
            "Clean up unused {x} in {y}",
            "Update {y} to latest framework version",
        ],
        "descs": [
            "{y} dependencies are several versions behind and need upgrading.",
            "Tech debt in {y} is slowing down feature work, needs refactor.",
            "Remove dead {x} code left over from the old {y} implementation.",
        ],
    },
    "Security": {
        "titles": [
            "Patch {x} vulnerability in {y}",
            "Rotate {x} credentials for {y}",
            "Audit {y} for security issues",
            "Fix exposed {x} endpoint in {y}",
        ],
        "descs": [
            "Security scan flagged a {x} vulnerability in {y}.",
            "Pen test found an exposed {x} in the {y} API.",
            "Compliance requires rotating {x} used by {y} this month.",
        ],
    },
}

FILLERS_X = ["mobile", "checkout", "search", "payment", "user profile", "reporting",
             "authentication", "billing", "chat", "upload", "export", "analytics",
             "SSO", "OAuth token", "session"]
FILLERS_Y = ["backend API", "React frontend", "payments service", "notification service",
             "admin dashboard", "mobile app", "user service", "search service",
             "billing module", "checkout flow", "auth service", "reporting engine"]

URGENT_PHRASES = [
    "This is blocking the release and needs to be fixed ASAP.",
    "Critical: production is down, all hands on this now.",
    "Urgent request from the CEO, needs to ship today.",
    "Customer-facing outage, top priority.",
    "This is a P0 blocker for the launch tomorrow.",
]
HIGH_PHRASES = [
    "This is high priority for the upcoming release.",
    "Important for the client demo next week.",
    "Needed before end of sprint, please prioritize.",
]
LOW_PHRASES = [
    "No rush, whenever you get a chance.",
    "Nice to have, low priority.",
    "Can be picked up next quarter.",
    "Someday/maybe, not time sensitive.",
]


def fill(template):
    return template.format(x=random.choice(FILLERS_X), y=random.choice(FILLERS_Y))


def make_row(idx):
    category = random.choice(list(CATEGORIES.keys()))
    spec = CATEGORIES[category]
    title = fill(random.choice(spec["titles"]))
    desc = fill(random.choice(spec["descs"]))

    urgency_roll = random.random()
    if urgency_roll < 0.12:
        desc += " " + random.choice(URGENT_PHRASES)
        true_priority = "URGENT"
        days_until_due = random.randint(-2, 1)  # overdue or due almost immediately
    elif urgency_roll < 0.35:
        desc += " " + random.choice(HIGH_PHRASES)
        true_priority = "HIGH"
        days_until_due = random.randint(1, 5)
    elif urgency_roll < 0.7:
        true_priority = "MEDIUM"
        days_until_due = random.randint(3, 14)
    else:
        desc += " " + random.choice(LOW_PHRASES)
        true_priority = "LOW"
        days_until_due = random.randint(14, 60)

    due_date = date.today() + timedelta(days=days_until_due)

    return {
        "title": title,
        "description": desc,
        "category": category,
        "priority": true_priority,
        "days_until_due": days_until_due,
        "due_date": due_date.isoformat(),
    }


def main(n=3000, out_path="ml/data/tasks_training_data.csv"):
    rows = [make_row(i) for i in range(n)]
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["title", "description", "category",
                                                "priority", "days_until_due", "due_date"])
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {n} rows to {out_path}")


if __name__ == "__main__":
    main()
