<template>
  <Col>
    <!-- Header -->
    <Row>
      <Box :padding="1" color="cyan" borderStyle="double">
        <TextBox bold>Vuetty Layout System - Feature Showcase</TextBox>
      </Box>
    </Row>

    <!-- Section 1: Basic Row with flex -->
    <TextBox color="yellow">1. Row > Col with Flex Distribution (1:2:1 ratio)</TextBox>
    <Row>
      <Col :flex="1">
        <Box :padding="1" color="green">
          <TextBox>flex=1</TextBox>
        </Box>
      </Col>
      <Col :flex="2">
        <Box :padding="1" color="blue">
          <TextBox>flex=2 (double width)</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="magenta">
          <TextBox>flex=1</TextBox>
        </Box>
      </Col>
    </Row>

    <!-- Section 2: Pixel-Perfect Distribution -->
    <TextBox color="yellow">2. Pixel-Perfect Rounding (100px / 3 items = 34+33+33)</TextBox>
    <Row>
      <Col :flex="1">
        <Box :padding="1" color="cyan">
          <TextBox>A</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="green">
          <TextBox>B</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="magenta">
          <TextBox>C</TextBox>
        </Box>
      </Col>
    </Row>

    <!-- Section 3: Col defaults to flex=1 -->
    <TextBox color="yellow">3. Col Auto-Grows (defaults to flex=1) - Full Terminal Width</TextBox>
    <Row>
      <!-- No width prop = uses full terminal width -->
      <Col :flex="0">
        <Box :padding="1" color="blue">
          <TextBox>Fixed</TextBox>
        </Box>
      </Col>
      <Col>
        <!-- Col defaults to flex=1, so it fills remaining space -->
        <Box :padding="1" color="green">
          <TextBox>Auto-grow to fill terminal width!</TextBox>
        </Box>
      </Col>
    </Row>

    <!-- Section 4: justifyContent -->
    <TextBox color="yellow">4. justifyContent="center"</TextBox>
    <Row justifyContent="center">
      <Box :padding="1" color="magenta">
        <TextBox>Centered</TextBox>
      </Box>
      <Box :padding="1" color="cyan">
        <TextBox>Items</TextBox>
      </Box>
    </Row>

    <!-- Section 5: alignItems -->
    <TextBox color="yellow">5. alignItems="center" (vertical alignment)</TextBox>
    <Row alignItems="center">
      <Box :padding="2" color="green">
        <TextBox>Tall</TextBox>
        <TextBox>Box</TextBox>
      </Box>
      <Box :padding="1" color="blue">
        <TextBox>Short</TextBox>
      </Box>
      <Box :padding="3" color="magenta">
        <TextBox>Very</TextBox>
        <TextBox>Tall</TextBox>
        <TextBox>Box</TextBox>
      </Box>
    </Row>

    <!-- Section 6: Vertical Flex with Col (with explicit height) -->
    <TextBox color="yellow">6. Col with Vertical Flex (height=14, flex ratio 1:2:1)</TextBox>
    <Col :height="14">
      <Box :flex="1" color="cyan">
        <TextBox>Top (flex=1)</TextBox>
      </Box>
      <Box :flex="2" color="green">
        <TextBox>Middle (flex=2)</TextBox>
      </Box>
      <Box :flex="1" color="magenta">
        <TextBox>Bottom (flex=1)</TextBox>
      </Box>
    </Col>

    <!-- Section 7: Row > Col Pattern (CSS Standard) -->
    <TextBox color="yellow">7. CSS-Standard Pattern: Row > Col (Sidebar + Main)</TextBox>
    <Row>
      <Col>
        <!-- Col defaults to flex=1 -->
        <Box :padding="1" color="cyan">
          <TextBox>Sidebar</TextBox>
          <TextBox>(auto flex=1)</TextBox>
        </Box>
      </Col>
      <Col :flex="3">
        <Box :padding="1" color="green">
          <TextBox>Main Content Area</TextBox>
          <TextBox>(flex=3, 3x larger)</TextBox>
        </Box>
      </Col>
    </Row>

    <!-- Section 8: Flex Wrap -->
    <TextBox color="yellow">8. Flex Wrap (width=50, items wrap to new line)</TextBox>
    <Row :width="50" flexWrap="wrap">
      <Col :flex="1">
        <Box :padding="1" color="cyan">
          <TextBox>Item 1</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="green">
          <TextBox>Item 2</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="blue">
          <TextBox>Item 3</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="magenta">
          <TextBox>Item 4</TextBox>
        </Box>
      </Col>
    </Row>

    <TextBox color="yellow">9. Responsive Card Grid (minWidth controls breakpoint)</TextBox>
    <Row responsive alignContent="flex-start">
      <Col :minWidth="25" :flex="1">
        <Box :padding="1" color="cyan">
          <TextBox bold>Card 1</TextBox>
          <TextBox dim>Description here</TextBox>
        </Box>
      </Col>
      <Col :minWidth="25" :flex="1">
        <Box :padding="1" color="green">
          <TextBox bold>Card 2</TextBox>
          <TextBox dim>Description here</TextBox>
        </Box>
      </Col>
      <Col :minWidth="25" :flex="1">
        <Box :padding="1" color="blue">
          <TextBox bold>Card 3</TextBox>
          <TextBox dim>Description here</TextBox>
        </Box>
      </Col>
      <Col :minWidth="25" :flex="1">
        <Box :padding="1" color="magenta">
          <TextBox bold>Card 4</TextBox>
          <TextBox dim>Description here</TextBox>
        </Box>
      </Col>
    </Row>

    <!-- Footer -->
    <Box :padding="1" color="gray" borderStyle="dashed">
      <TextBox dim>Press Ctrl+C to exit | New: Row>Col pattern, Col auto-grows, full terminal width</TextBox>
    </Box>

    <!-- Section 10: Individual Flex Properties -->
    <TextBox color="yellow">10. Individual Flex Properties (flexGrow, flexShrink, flexBasis)</TextBox>
    <Row>
      <Col :flexGrow="2" :flexShrink="1" :flexBasis="0">
        <Box :padding="1" color="cyan">
          <TextBox>flexGrow=2</TextBox>
          <TextBox dim>flexShrink=1</TextBox>
        </Box>
      </Col>
      <Col :flexGrow="1" :flexShrink="0" :flexBasis="50">
        <Box :padding="1" color="green">
          <TextBox>flexGrow=1</TextBox>
          <TextBox dim>flexShrink=0</TextBox>
          <TextBox dim>flexBasis=50</TextBox>
        </Box>
      </Col>
      <Col :flexGrow="3" :flexShrink="1" :flexBasis="0">
        <Box :padding="1" color="magenta">
          <TextBox>flexGrow=3</TextBox>
          <TextBox dim>flexShrink=1</TextBox>
        </Box>
      </Col>
    </Row>

    <!-- Section 11: alignSelf -->
    <TextBox color="yellow">11. alignSelf (Per-Item Alignment Override)</TextBox>
    <Row alignItems="stretch">
      <Col alignSelf="flex-start">
        <Box :padding="1" color="cyan">
          <TextBox>alignSelf=</TextBox>
          <TextBox>flex-start</TextBox>
        </Box>
      </Col>
      <Col alignSelf="center">
        <Box :padding="3" color="green">
          <TextBox>Tall</TextBox>
          <TextBox>alignSelf=</TextBox>
          <TextBox>center</TextBox>
        </Box>
      </Col>
      <Col alignSelf="flex-end">
        <Box :padding="1" color="magenta">
          <TextBox>alignSelf=</TextBox>
          <TextBox>flex-end</TextBox>
        </Box>
      </Col>
      <Col>
        <Box :padding="2" color="blue">
          <TextBox>default</TextBox>
          <TextBox>(stretch)</TextBox>
        </Box>
      </Col>
    </Row>

    <!-- Section 12: Dimension Constraints -->
    <TextBox color="yellow">12. Dimension Constraints (maxWidth, maxHeight)</TextBox>
    <Row>
      <Col :flex="2" :maxWidth="30">
        <Box :padding="1" color="cyan">
          <TextBox>flex=2 but maxWidth=30</TextBox>
          <TextBox dim>Wont grow beyond 30 chars</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="green">
          <TextBox>flex=1 (grows normally)</TextBox>
        </Box>
      </Col>
    </Row>
    <Col :height="16">
      <Box :flex="1" :maxHeight="3" :padding="1" color="blue">
        <TextBox>maxHeight=3 in 10-tall Col</TextBox>
      </Box>
      <Box :flex="1" :padding="1" color="magenta">
        <TextBox>Remaining space</TextBox>
      </Box>
    </Col>

    <!-- Section 13: justifyContent Variants -->
    <TextBox color="yellow">13. justifyContent Variants</TextBox>
    <TextBox dim>space-between:</TextBox>
    <Row justifyContent="space-between">
      <Box :padding="1" color="cyan"><TextBox>A</TextBox></Box>
      <Box :padding="1" color="green"><TextBox>B</TextBox></Box>
      <Box :padding="1" color="blue"><TextBox>C</TextBox></Box>
    </Row>
    <TextBox dim>space-around:</TextBox>
    <Row justifyContent="space-around">
      <Box :padding="1" color="cyan"><TextBox>A</TextBox></Box>
      <Box :padding="1" color="green"><TextBox>B</TextBox></Box>
      <Box :padding="1" color="blue"><TextBox>C</TextBox></Box>
    </Row>
    <TextBox dim>space-evenly:</TextBox>
    <Row justifyContent="space-evenly">
      <Box :padding="1" color="cyan"><TextBox>A</TextBox></Box>
      <Box :padding="1" color="green"><TextBox>B</TextBox></Box>
      <Box :padding="1" color="blue"><TextBox>C</TextBox></Box>
    </Row>
    <TextBox dim>flex-end:</TextBox>
    <Row justifyContent="flex-end">
      <Box :padding="1" color="cyan"><TextBox>A</TextBox></Box>
      <Box :padding="1" color="green"><TextBox>B</TextBox></Box>
      <Box :padding="1" color="blue"><TextBox>C</TextBox></Box>
    </Row>

    <!-- Section 14: alignContent Multi-Line -->
    <TextBox color="yellow">14. alignContent (Multi-Line Alignment, height=10)</TextBox>
    <TextBox dim>alignContent="space-between":</TextBox>
    <Row :width="40" :height="10" flexWrap="wrap" alignContent="space-between">
      <Col :flex="1"><Box :padding="1" color="cyan"><TextBox>Item 1</TextBox></Box></Col>
      <Col :flex="1"><Box :padding="1" color="green"><TextBox>Item 2</TextBox></Box></Col>
      <Col :flex="1"><Box :padding="1" color="blue"><TextBox>Item 3</TextBox></Box></Col>
      <Col :flex="1"><Box :padding="1" color="magenta"><TextBox>Item 4</TextBox></Box></Col>
    </Row>

    <!-- Section 15: Individual Padding Properties -->
    <TextBox color="yellow">15. Individual Padding Properties</TextBox>
    <Row>
      <Box :paddingLeft="5" :paddingRight="2" :paddingTop="0" :paddingBottom="1" color="cyan">
        <TextBox>L=5 R=2</TextBox>
        <TextBox>T=0 B=1</TextBox>
      </Box>
      <Box :paddingLeft="1" :paddingRight="5" :paddingTop="2" :paddingBottom="0" color="green">
        <TextBox>L=1 R=5</TextBox>
        <TextBox>T=2 B=0</TextBox>
      </Box>
    </Row>

    <!-- Section 16: Margin Properties -->
    <TextBox color="yellow">16. Margin Properties (spacing between items)</TextBox>
    <Row>
      <Box :padding="1" :marginRight="3" color="cyan">
        <TextBox>marginRight=3</TextBox>
      </Box>
      <Box :padding="1" :marginRight="5" color="green">
        <TextBox>marginRight=5</TextBox>
      </Box>
      <Box :padding="1" color="blue">
        <TextBox>no margin</TextBox>
      </Box>
    </Row>
    <Col>
      <Box :padding="1" :marginBottom="2" color="magenta">
        <TextBox>marginBottom=2</TextBox>
      </Box>
      <Box :padding="1" color="cyan">
        <TextBox>Next item</TextBox>
      </Box>
    </Col>

    <!-- Section 17: flexWrap wrap-reverse -->
    <TextBox color="yellow">17. flexWrap="wrap-reverse" (width=50, wraps in reverse)</TextBox>
    <Row :width="50" flexWrap="wrap-reverse">
      <Col :flex="1"><Box :padding="1" color="cyan"><TextBox>Item 1</TextBox></Box></Col>
      <Col :flex="1"><Box :padding="1" color="green"><TextBox>Item 2</TextBox></Box></Col>
      <Col :flex="1"><Box :padding="1" color="blue"><TextBox>Item 3</TextBox></Box></Col>
      <Col :flex="1"><Box :padding="1" color="magenta"><TextBox>Item 4</TextBox></Box></Col>
    </Row>

    <!-- Section 18: flex=0 (No Flex Growth) -->
    <TextBox color="yellow">18. flex=0 (No Growth) - Fixed Size Items</TextBox>
    <Row>
      <Col :flex="0">
        <Box :padding="1" color="cyan">
          <TextBox>flex=0</TextBox>
          <TextBox dim>Fixed</TextBox>
        </Box>
      </Col>
      <Col :flex="1">
        <Box :padding="1" color="green">
          <TextBox>flex=1 - Grows to fill space</TextBox>
        </Box>
      </Col>
      <Col :flex="0">
        <Box :padding="1" color="magenta">
          <TextBox>flex=0</TextBox>
          <TextBox dim>Fixed</TextBox>
        </Box>
      </Col>
    </Row>

    <!-- Section 19: Complex Nesting (Col > Row > Col) -->
    <TextBox color="yellow">19. Complex Nesting: Col > Row > Col (Sidebar + Header + Content)</TextBox>
    <Col :height="12">
      <!-- Header Row -->
      <Row>
        <Box :padding="1" color="cyan" borderStyle="double">
          <TextBox bold>Header (Row in Col)</TextBox>
        </Box>
      </Row>
      <!-- Content Row with nested Cols -->
      <Row :flex="1">
        <Col :flex="1">
          <Box :padding="1" color="green">
            <TextBox>Sidebar</TextBox>
            <TextBox dim>(Col in Row)</TextBox>
          </Box>
        </Col>
        <Col :flex="3">
          <Box :padding="1" color="blue">
            <TextBox>Main Content Area</TextBox>
            <TextBox dim>(Col in Row in Col)</TextBox>
            <TextBox dim>3x wider than sidebar</TextBox>
          </Box>
        </Col>
      </Row>
      <!-- Footer Row -->
      <Row>
        <Box :padding="1" color="magenta" borderStyle="dashed">
          <TextBox dim>Footer (Row in Col)</TextBox>
        </Box>
      </Row>
    </Col>

    <TextBox color="cyan" bold>Architecture:</TextBox>
    <TextBox dim>- Row = horizontal flex container (defaults to full terminal width)</TextBox>
    <TextBox dim>- Col = flex item + vertical container (defaults to flex=1)</TextBox>
    <TextBox dim>- Box = visual only (borders, padding, colors)</TextBox>
  </Col>
</template>

<script setup>
import { Box, TextBox, Col, Row } from 'vuetty';
</script>
